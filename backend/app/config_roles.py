"""
Shared configuration for HH.ru scraper roles and settings.
This file is used by both the scraper and scheduler to maintain consistency.
"""

from app.config import settings

# All IT roles to scrape from HH.ru (Kazakhstan, area=40)
ROLES = [
    {"id": 96,  "name": "Programmer / Developer"},
    {"id": 160, "name": "DevOps Engineer"},
    {"id": 124, "name": "QA / Tester"},
    {"id": 10,  "name": "Analyst"},
    {"id": 148, "name": "System Analyst"},
    {"id": 164, "name": "Product Analyst"},
    {"id": 165, "name": "Data Scientist"},
    {"id": 156, "name": "BI Analyst"},
    {"id": 107, "name": "Project Manager"},
    {"id": 73,  "name": "Product Manager"},
    {"id": 104, "name": "Team Lead"},
    {"id": 113, "name": "System Administrator"},
    {"id": 34,  "name": "UI/UX Designer"},
    {"id": 25,  "name": "Game Designer"},
    {"id": 116, "name": "Security Engineer"},
    {"id": 126, "name": "Technical Writer"},
]

# Special search queries for technology-specific searches
SPECIAL_QUERIES = [
    "Backend", "Frontend", "Fullstack", "DevOps", "Architect", "Mobile",
    "Android", "iOS", "Flutter", "React", "Python", "Java", "Go", "C++",
    "Data Scientist", "Machine Learning", "AI", "LLM", "Data Engineer"
]

# Exchange rates for salary normalization to KZT
EXCHANGE_RATES = {
    "USD": settings.EXCHANGE_RATE_USD,
    "EUR": settings.EXCHANGE_RATE_EUR,
    "RUB": settings.EXCHANGE_RATE_RUB,
    "KZT": 1
}
