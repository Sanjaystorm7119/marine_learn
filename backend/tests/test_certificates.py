"""
Tests for course completion certificate endpoints.

  POST /study/certificates   — issue (or return existing) certificate
  GET  /study/certificates   — list the current user's certificates
"""

import models
from auth import create_access_token


# ── POST /study/certificates ───────────────────────────────────────────────────

class TestIssueCertificate:

    def test_creates_certificate_with_correct_fields(self, client, test_user, auth_headers):
        resp = client.post(
            "/study/certificates",
            json={"course_title": "ECDIS Fundamentals"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["course_title"] == "ECDIS Fundamentals"
        assert data["user_full_name"] == test_user.full_name
        assert data["certificate_number"].startswith("MAR-")
        assert len(data["certificate_number"]) == 12          # "MAR-" + 8 chars
        assert "issued_at" in data
        assert data["id"] > 0

    def test_is_idempotent(self, client, auth_headers):
        """Calling POST twice for the same course returns the same certificate."""
        payload = {"course_title": "Firefighting & Fire Prevention"}
        r1 = client.post("/study/certificates", json=payload, headers=auth_headers)
        r2 = client.post("/study/certificates", json=payload, headers=auth_headers)

        assert r1.status_code == 200
        assert r2.status_code == 200
        assert r1.json()["certificate_number"] == r2.json()["certificate_number"]
        assert r1.json()["issued_at"] == r2.json()["issued_at"]

    def test_different_courses_produce_different_certificates(self, client, auth_headers):
        r1 = client.post(
            "/study/certificates",
            json={"course_title": "ECDIS Fundamentals"},
            headers=auth_headers,
        )
        r2 = client.post(
            "/study/certificates",
            json={"course_title": "Firefighting & Fire Prevention"},
            headers=auth_headers,
        )
        assert r1.status_code == 200
        assert r2.status_code == 200
        assert r1.json()["certificate_number"] != r2.json()["certificate_number"]

    def test_requires_authentication(self, client):
        """Request without a token must be rejected."""
        resp = client.post(
            "/study/certificates",
            json={"course_title": "ECDIS Fundamentals"},
        )
        assert resp.status_code in (401, 403)

    def test_certificate_number_format(self, client, auth_headers):
        """Certificate number follows the MAR-XXXXXXXX pattern."""
        resp = client.post(
            "/study/certificates",
            json={"course_title": "Basic Safety Training"},
            headers=auth_headers,
        )
        num = resp.json()["certificate_number"]
        assert num.startswith("MAR-")
        suffix = num[4:]
        assert len(suffix) == 8
        assert suffix == suffix.upper()


# ── GET /study/certificates ────────────────────────────────────────────────────

class TestListCertificates:

    def test_empty_list_for_new_user(self, client, auth_headers):
        resp = client.get("/study/certificates", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_returns_all_issued_certificates(self, client, auth_headers):
        client.post("/study/certificates", json={"course_title": "ECDIS Fundamentals"}, headers=auth_headers)
        client.post("/study/certificates", json={"course_title": "Firefighting"}, headers=auth_headers)

        resp = client.get("/study/certificates", headers=auth_headers)
        assert resp.status_code == 200
        certs = resp.json()
        assert len(certs) == 2
        titles = {c["course_title"] for c in certs}
        assert "ECDIS Fundamentals" in titles
        assert "Firefighting" in titles

    def test_each_cert_has_required_fields(self, client, auth_headers):
        client.post(
            "/study/certificates",
            json={"course_title": "ECDIS Fundamentals"},
            headers=auth_headers,
        )
        resp = client.get("/study/certificates", headers=auth_headers)
        cert = resp.json()[0]

        for field in ("id", "certificate_number", "course_title", "user_full_name", "issued_at"):
            assert field in cert, f"Missing field: {field}"

    def test_requires_authentication(self, client):
        resp = client.get("/study/certificates")
        assert resp.status_code in (401, 403)

    def test_users_cannot_see_each_others_certificates(self, client, db, auth_headers):
        """Certificates issued for user A are NOT visible to user B."""
        # Issue a cert as user 1
        client.post(
            "/study/certificates",
            json={"course_title": "ECDIS Fundamentals"},
            headers=auth_headers,
        )

        # Create a second user and get their token
        from passlib.context import CryptContext
        pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
        user2 = models.User(
            full_name="Other Sailor",
            email="other@example.com",
            hashed_password=pwd.hash("pass"),
            role="crew",
        )
        db.add(user2)
        db.commit()
        token2 = create_access_token({"sub": "other@example.com"})
        headers2 = {"Authorization": f"Bearer {token2}"}

        resp = client.get("/study/certificates", headers=headers2)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_issuing_same_course_twice_shows_one_entry(self, client, auth_headers):
        """Idempotent issue means the list only has one entry per course."""
        payload = {"course_title": "ECDIS Fundamentals"}
        client.post("/study/certificates", json=payload, headers=auth_headers)
        client.post("/study/certificates", json=payload, headers=auth_headers)

        resp = client.get("/study/certificates", headers=auth_headers)
        assert len(resp.json()) == 1


# ── Dashboard certificate count ────────────────────────────────────────────────

class TestDashboardCertificateCount:

    def test_certificate_count_reflects_issued_certs(self, client, auth_headers):
        """GET /study/dashboard certificates count matches actual issued certificates."""
        resp_before = client.get("/study/dashboard", headers=auth_headers)
        count_before = resp_before.json().get("certificates", -1)
        assert count_before == 0

        client.post("/study/certificates", json={"course_title": "ECDIS Fundamentals"}, headers=auth_headers)
        client.post("/study/certificates", json={"course_title": "Firefighting"}, headers=auth_headers)

        resp_after = client.get("/study/dashboard", headers=auth_headers)
        assert resp_after.json()["certificates"] == 2


# ── Additional edge-case tests ─────────────────────────────────────────────────

class TestIssueCertificateEdgeCases:

    def test_issued_at_is_iso_string(self, client, auth_headers):
        """CertificateResponse.issued_at must be a parseable ISO-8601 string."""
        from datetime import datetime
        resp = client.post(
            "/study/certificates",
            json={"course_title": "Basic Safety Training"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        issued_at = resp.json()["issued_at"]
        assert isinstance(issued_at, str)
        # Must be parseable as a datetime
        dt = datetime.fromisoformat(issued_at)
        assert dt.year >= 2024

    def test_certificate_persisted_in_database(self, client, db, auth_headers, test_user):
        """After POST the certificate row must exist in the DB."""
        resp = client.post(
            "/study/certificates",
            json={"course_title": "ECDIS Fundamentals"},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        cert_id = resp.json()["id"]

        db_cert = db.query(models.Certificate).filter_by(id=cert_id).first()
        assert db_cert is not None
        assert db_cert.course_title == "ECDIS Fundamentals"
        assert db_cert.user_id == test_user.id

    def test_each_certificate_has_unique_number(self, client, auth_headers):
        """Certificates for different courses must have unique numbers."""
        courses = [
            "ECDIS Fundamentals",
            "Firefighting & Fire Prevention",
            "Basic Safety Training",
        ]
        numbers = set()
        for title in courses:
            resp = client.post(
                "/study/certificates",
                json={"course_title": title},
                headers=auth_headers,
            )
            assert resp.status_code == 200
            numbers.add(resp.json()["certificate_number"])
        assert len(numbers) == len(courses), "Certificate numbers must be unique per course"

    def test_response_contains_user_full_name(self, client, auth_headers, test_user):
        """Issued certificate includes the authenticated user's full name."""
        resp = client.post(
            "/study/certificates",
            json={"course_title": "ECDIS Fundamentals"},
            headers=auth_headers,
        )
        assert resp.json()["user_full_name"] == test_user.full_name

    def test_invalid_token_is_rejected(self, client):
        """A malformed/invalid Bearer token must be rejected."""
        resp = client.post(
            "/study/certificates",
            json={"course_title": "ECDIS Fundamentals"},
            headers={"Authorization": "Bearer this.is.not.valid"},
        )
        assert resp.status_code in (401, 403)


class TestListCertificatesOrdering:

    def test_certificates_returned_newest_first(self, client, db, auth_headers, test_user):
        """GET /study/certificates returns certs ordered by issued_at descending."""
        import time
        from datetime import datetime, timedelta

        # Insert two certs directly with known issued_at timestamps
        older = models.Certificate(
            user_id=test_user.id,
            course_title="Older Course",
            issued_at=datetime(2025, 1, 1),
            certificate_number="MAR-OLDER001",
        )
        newer = models.Certificate(
            user_id=test_user.id,
            course_title="Newer Course",
            issued_at=datetime(2025, 6, 1),
            certificate_number="MAR-NEWER001",
        )
        db.add_all([older, newer])
        db.commit()

        resp = client.get("/study/certificates", headers=auth_headers)
        assert resp.status_code == 200
        certs = resp.json()
        assert len(certs) == 2
        # Newest-first: "Newer Course" must come before "Older Course"
        assert certs[0]["course_title"] == "Newer Course"
        assert certs[1]["course_title"] == "Older Course"

    def test_get_certificates_returns_list_type(self, client, auth_headers):
        """GET /study/certificates always returns a JSON array."""
        resp = client.get("/study/certificates", headers=auth_headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)