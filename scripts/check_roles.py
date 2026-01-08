import requests
import json

def get_it_roles():
    url = "https://api.hh.ru/professional_roles"
    response = requests.get(url)
    data = response.json()
    
    # Ищем категорию IT
    # Обычно это "Информационные технологии"
    it_category = None
    for category in data['categories']:
        if "информационные технологии" in category['name'].lower():
            it_category = category
            break
            
    if not it_category:
        print("❌ Категория IT не найдена!")
        # Выведем все категории для отладки
        for cat in data['categories']:
            print(f"- {cat['name']} (ID: {cat['id']})")
        return

    print(f"✅ Найдена категория: {it_category['name']} (ID: {it_category['id']})")
    print("-" * 40)
    
    # Выводим все роли в этой категории
    for role in it_category['roles']:
        print(f"Role: {role['name']}, ID: {role['id']}")

if __name__ == "__main__":
    get_it_roles()
