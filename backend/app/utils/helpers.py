from typing import Optional


def determine_grade(title_raw: str, experience_id: str) -> Optional[str]:
    """
    Determine grade (Junior, Middle, Senior, Lead) from title and experience.
    """
    if not title_raw:
        return None

    title = title_raw.lower()

    # Exclude obviously non-target vacancies.
    stop_words = [
        "sales",
        "hr",
        "recruiter",
        "support",
        "\u043e\u043f\u0435\u0440\u0430\u0442\u043e\u0440",
        "\u043f\u0440\u043e\u0434\u0430\u0436",
    ]
    if any(sw in title for sw in stop_words):
        return None

    if "manager" in title and not any(
        ok in title for ok in ["product", "project", "delivery", "account"]
    ):
        return None

    grade = None

    if any(
        w in title
        for w in [
            "team lead",
            "tech lead",
            "cto",
            "head",
            "director",
            "\u043b\u0438\u0434",
            "\u0440\u0443\u043a\u043e\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044c",
            "lead",
        ]
    ):
        grade = "Lead"
    elif any(
        w in title
        for w in [
            "senior",
            "\u0441\u0435\u043d\u044c\u043e\u0440",
            "sr.",
            "\u0432\u0435\u0434\u0443\u0449\u0438\u0439",
            "principal",
        ]
    ):
        grade = "Senior"
    elif any(w in title for w in ["middle", "\u043c\u0438\u0434\u043b"]):
        grade = "Middle"
    elif any(
        w in title
        for w in [
            "intern",
            "\u0441\u0442\u0430\u0436\u0435\u0440",
            "trainee",
            "junior",
            "\u043c\u043b\u0430\u0434\u0448\u0438\u0439",
        ]
    ):
        grade = "Junior"

    if not grade:
        if experience_id == "noExperience":
            grade = "Junior"
        elif experience_id == "between1And3":
            # Conservative fallback for 1-3 years when title gives no signal.
            grade = "Junior"
        elif experience_id == "between3And6":
            grade = "Middle"
        elif experience_id == "moreThan6":
            grade = "Senior"

    if grade in ["Senior", "Lead"] and experience_id == "noExperience":
        grade = "Junior"

    return grade
