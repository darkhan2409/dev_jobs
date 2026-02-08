from enum import Enum

class GradeEnum(str, Enum):
    """Allowed grade values for filtering vacancies."""
    junior = "Junior"
    middle = "Middle"
    senior = "Senior"
    lead = "Lead"

class SortEnum(str, Enum):
    """Allowed sort options for vacancies."""
    newest = "newest"
    oldest = "oldest"
    salary_desc = "salary_desc"
    salary_asc = "salary_asc"
