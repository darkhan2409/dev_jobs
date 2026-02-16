"""
Script to create test database for integration tests using async approach.
"""
import asyncio
import asyncpg


async def create_test_db():
    """Create test database if it doesn't exist."""
    # Connect to default postgres database
    conn = await asyncpg.connect(
        host="localhost",
        port=5432,
        user="postgres",
        password="1234",
        database="postgres"
    )
    
    try:
        # Check if database exists
        exists = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = 'dev_jobs_test'"
        )
        
        if exists:
            print("✅ Database 'dev_jobs_test' already exists")
        else:
            # Create database (cannot be done in a transaction)
            await conn.execute("CREATE DATABASE dev_jobs_test")
            print("✅ Created database 'dev_jobs_test'")
    except asyncpg.exceptions.DuplicateDatabaseError:
        print("✅ Database 'dev_jobs_test' already exists")
    finally:
        await conn.close()
    
    print("\n🔄 Ready to run tests!")
    print("Run: pytest tests/ -k 'integration' -v")


if __name__ == "__main__":
    asyncio.run(create_test_db())
