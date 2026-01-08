import re
import html
from typing import Optional

CLEAN_RE = re.compile('<.*?>')

def clean_html(raw_html: str) -> str:
    if not raw_html:
        return ""
    # 1. Удаляем теги
    clean_text = re.sub(CLEAN_RE, '', raw_html)
    # 2. Декодируем сущности (&nbsp; -> ' ')
    return html.unescape(clean_text).strip()

def determine_grade(title_raw: str, experience_id: str) -> Optional[str]:
    """
    Определяет грейд (Junior, Middle, Senior, Lead) на основе заголовка и опыта.
    """
    if not title_raw:
        return None
        
    title = title_raw.lower()
    
    # 1. Фильтр стоп-слов (не целевые вакансии)
    # Исключаем sales, hr, recruiter, support, account manager
    # Но оставляем Product/Project manager
    stop_words = ["sales", "hr", "recruiter", "support", "оператор", "продаж"]
    if any(sw in title for sw in stop_words):
        return None
        
    if "manager" in title and not any(ok in title for ok in ["product", "project", "delivery", "account"]):
        # Если просто менеджер, но не продуктовый/проектный -> скорее всего не то
        # Но account часто бывает в IT. Оставим на усмотрение, но по ТЗ просили фильтровать.
        # Если просто менеджер, но не продуктовый/проектный -> скорее всего не то
        return None 

    # 2. Поиск ключевых слов (Приоритет 1)
    grade = None
    
    # Lead / Head
    if any(w in title for w in ["team lead", "tech lead", "cto", "head", "director", "лид", "руководитель", "lead"]):
        grade = "Lead"
    # Senior
    elif any(w in title for w in ["senior", "сеньор", "sr.", "ведущий", "principal"]):
        grade = "Senior"
    # Middle
    elif any(w in title for w in ["middle", "мидл"]):
        grade = "Middle"
    # Junior
    elif any(w in title for w in ["intern", "стажер", "trainee", "junior", "младший"]):
        grade = "Junior"
        
    # 3. Маппинг по опыту (Приоритет 2, если не нашли по заголовку)
    if not grade:
        if experience_id == "noExperience":
            grade = "Junior"
        elif experience_id == "between1And3":
            grade = "Junior" # Консервативный подход
        elif experience_id == "between3And6":
            grade = "Middle"
        elif experience_id == "moreThan6":
            grade = "Senior"
            
    # 4. Разрешение конфликтов (Sanity Check)
    
    # Если заголовок Senior/Lead, а опыта ВООБЩЕ нет -> это Junior (ошибка HR или скам)
    if grade in ["Senior", "Lead"] and experience_id == "noExperience":
        grade = "Junior"
        
    # Если заголовок Junior, а опыта 6+ лет -> это свитчер, оставляем Junior
    # (логика уже соблюдена, так как keywords имеют приоритет над experience mapping)
    
    return grade