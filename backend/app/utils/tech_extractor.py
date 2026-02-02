"""
Utility to extract technology stack from vacancy text.
"""
import re
from typing import List, Set

# Comprehensive list of technologies to search for
TECH_KEYWORDS = {
    # Languages
    'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Golang', 'C#', 'C++', 'PHP', 
    'Ruby', 'Swift', 'Kotlin', 'Rust', 'Scala', 'Perl', 'R', 'Dart', 'Elixir',
    
    # Frontend
    'React', 'ReactJS', 'Vue', 'Vue.js', 'Angular', 'AngularJS', 'Svelte', 'Next.js', 
    'Nuxt', 'Gatsby', 'jQuery', 'Ember', 'Backbone',
    'HTML', 'HTML5', 'CSS', 'CSS3', 'SASS', 'SCSS', 'LESS', 'Tailwind', 'Bootstrap',
    'Material-UI', 'Ant Design', 'Chakra UI',
    
    # Backend/Frameworks
    'Node.js', 'Node', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot',
    'Laravel', 'Symfony', 'Rails', 'Ruby on Rails', 'ASP.NET', '.NET', 'Gin', 'Echo',
    'NestJS', 'Koa', 'Fastify',
    
    # Databases
    'PostgreSQL', 'Postgres', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 
    'MS SQL', 'SQL Server', 'MariaDB', 'Cassandra', 'DynamoDB', 'Elasticsearch',
    'ClickHouse', 'CouchDB', 'Neo4j',
    
    # DevOps/Tools
    'Docker', 'Kubernetes', 'K8s', 'Git', 'GitHub', 'GitLab', 'Bitbucket', 'DevOps',
    'Jenkins', 'CircleCI', 'Travis CI', 'GitHub Actions', 'GitLab CI',
    'Terraform', 'Ansible', 'Chef', 'Puppet', 'Vagrant',
    'Linux', 'Ubuntu', 'CentOS', 'Debian', 'RHEL',
    'Nginx', 'Apache', 'Tomcat',
    'AWS', 'Azure', 'GCP', 'Google Cloud', 'Heroku', 'DigitalOcean',
    'Prometheus', 'Grafana', 'ELK', 'Kibana', 'Logstash',
    
    # Mobile
    'Android', 'iOS', 'React Native', 'Flutter', 'Xamarin', 'Ionic',
    
    # Data/ML
    'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras',
    'Spark', 'Hadoop', 'Airflow', 'Kafka', 'RabbitMQ',
    
    # Testing
    'Jest', 'Mocha', 'Cypress', 'Selenium', 'Pytest', 'JUnit', 'TestNG',
    
    # Other
    'GraphQL', 'REST', 'gRPC', 'WebSocket', 'OAuth', 'JWT',
    'Microservices', 'Agile', 'Scrum', 'CI/CD',
}

def extract_tech_stack(text: str) -> List[str]:
    """
    Extract technology stack from vacancy text.
    
    Args:
        text: Combined text from title and description
        
    Returns:
        List of unique technologies found, sorted by relevance
    """
    if not text:
        return []
    
    found_techs: Set[str] = set()
    text_lower = text.lower()
    
    for tech in TECH_KEYWORDS:
        # Escape the tech string for regex
        escaped_tech = re.escape(tech.lower())
        
        # Use lookarounds for boundaries instead of \b to handle special chars (C++, C#, .NET)
        # (?<!\w) ensures preceding char is not a word char (or start of string)
        # (?!\w) ensures following char is not a word char (or end of string)
        pattern = r'(?<!\w)' + escaped_tech + r'(?!\w)'
        
        if re.search(pattern, text_lower):
            found_techs.add(tech)
    
    # Sort by length (longer names first)
    return sorted(found_techs, key=lambda x: (-len(x), x))



def extract_tech_from_vacancy(title: str, description: str) -> List[str]:
    """
    Extract tech stack from vacancy title and description.
    
    Args:
        title: Vacancy title
        description: Vacancy description (HTML or plain text)
        
    Returns:
        List of unique technologies found
    """
    # Combine title and description
    combined_text = f"{title} {description}"
    
    # Remove HTML tags if present
    combined_text = re.sub(r'<[^>]+>', ' ', combined_text)
    
    return extract_tech_stack(combined_text)
