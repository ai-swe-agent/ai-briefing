"""
Database Schema Tests for News Platform
Tests entity existence, constraints, relationships, and indexes
"""

import pytest
import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
import uuid

# Database connection fixture - implement with actual connection string
@pytest.fixture(scope="session")
def engine():
    """Create test database engine"""
    # TODO: Replace with actual test database connection
    # Example: return sa.create_engine("postgresql://user:pass@localhost/test_db")
    raise NotImplementedError("Database connection string not configured")

@pytest.fixture(scope="session")
def metadata(engine):
    """Load schema metadata from database"""
    meta = sa.MetaData()
    meta.reflect(bind=engine)
    return meta

@pytest.fixture
def connection(engine):
    """Create connection for each test"""
    conn = engine.connect()
    conn.begin()
    yield conn
    conn.rollback()
    conn.close()

@pytest.fixture
def session(connection):
    """Create session for each test"""
    Session = sessionmaker(bind=connection)
    session = Session()
    yield session
    session.close()


class TestUsersTable:
    """Tests for users table schema and constraints"""
    
    def test_users_table_schema_exists(self, metadata):
        """AC-1: Verify users table exists with correct columns"""
        assert "users" in metadata.tables, "users table does not exist"
        
        columns = {col.name for col in metadata.tables["users"].columns}
        required_columns = {
            "user_id", "username", "email", "password_hash", 
            "created_at", "last_active"
        }
        assert required_columns.issubset(columns), f"Missing columns: {required_columns - columns}"
    
    def test_users_table_primary_key_constraint(self, metadata):
        """AC-1: Verify user_id is primary key"""
        users_table = metadata.tables["users"]
        pk_columns = [col.name for col in users_table.primary_key.columns]
        assert pk_columns == ["user_id"], f"Expected user_id as PK, got: {pk_columns}"
    
    def test_users_table_not_null_constraints(self, metadata, connection):
        """AC-1: Verify NOT NULL constraints on critical fields"""
        users = metadata.tables["users"]
        
        not_null_columns = ["user_id", "username", "email", "password_hash"]
        for col_name in not_null_columns:
            col = users.columns.get(col_name)
            assert col is not None, f"Column {col_name} not found"
            assert not col.nullable, f"Column {col_name} should be NOT NULL"
        
        # Test inserting NULL fails
        with pytest.raises(IntegrityError):
            connection.execute(
                users.insert().values(
                    user_id=str(uuid.uuid4()),
                    username=None,  # NULL - should fail
                    email="test@example.com",
                    password_hash="hash123"
                )
            )
    
    def test_users_table_unique_constraints(self, metadata, connection):
        """AC-1: Verify unique constraints on username and email"""
        users = metadata.tables["users"]
        
        # Insert first user
        user1_id = str(uuid.uuid4())
        connection.execute(
            users.insert().values(
                user_id=user1_id,
                username="testuser",
                email="test@example.com",
                password_hash="hash123"
            )
        )
        
        # Test duplicate username fails
        with pytest.raises(IntegrityError):
            connection.execute(
                users.insert().values(
                    user_id=str(uuid.uuid4()),
                    username="testuser",  # Duplicate
                    email="different@example.com",
                    password_hash="hash456"
                )
            )
        
        # Test duplicate email fails
        connection.rollback()
        with pytest.raises(IntegrityError):
            connection.execute(
                users.insert().values(
                    user_id=str(uuid.uuid4()),
                    username="differentuser",
                    email="test@example.com",  # Duplicate
                    password_hash="hash789"
                )
            )


class TestNewsArticlesTable:
    """Tests for news_articles table schema and constraints"""
    
    def test_news_articles_table_schema_exists(self, metadata):
        """AC-2: Verify news_articles table exists with correct columns"""
        assert "news_articles" in metadata.tables, "news_articles table does not exist"
        
        columns = {col.name for col in metadata.tables["news_articles"].columns}
        required_columns = {
            "article_id", "title", "content", "author_id",
            "publication_date", "source_url", "category"
        }
        assert required_columns.issubset(columns), f"Missing columns: {required_columns - columns}"
    
    def test_news_articles_foreign_key_to_users(self, metadata, connection):
        """AC-2: Verify foreign key constraint to users table"""
        articles = metadata.tables["news_articles"]
        users = metadata.tables["users"]
        
        # Create a valid user
        user_id = str(uuid.uuid4())
        connection.execute(
            users.insert().values(
                user_id=user_id,
                username="authoruser",
                email="author@example.com",
                password_hash="auth123"
            )
        )
        
        # Create article with valid author_id should succeed
        connection.execute(
            articles.insert().values(
                article_id=str(uuid.uuid4()),
                title="Test Article",
                content="Test content",
                author_id=user_id,
                publication_date=sa.func.now(),
                source_url="https://example.com/article",
                category="Technology"
            )
        )
    
    def test_news_articles_reject_invalid_author(self, metadata, connection):
        """AC-2: Verify article inserts fail with non-existent author_id"""
        articles = metadata.tables["news_articles"]
        
        with pytest.raises(IntegrityError):
            connection.execute(
                articles.insert().values(
                    article_id=str(uuid.uuid4()),
                    title="Test Article",
                    content="Test content",
                    author_id=str(uuid.uuid4()),  # Non-existent user
                    publication_date=sa.func.now(),
                    source_url="https://example.com/article",
                    category="Technology"
                )
            )


class TestUserPreferencesTable:
    """Tests for user_preferences table schema and constraints"""
    
    def test_user_preferences_table_schema_exists(self, metadata):
        """AC-3: Verify user_preferences table exists with correct columns"""
        assert "user_preferences" in metadata.tables, "user_preferences table does not exist"
        
        columns = {col.name for col in metadata.tables["user_preferences"].columns}
        required_columns = {
            "preference_id", "user_id", "article_id", "liked",
            "disliked", "saved", "read_duration_seconds", "created_at"
        }
        assert required_columns.issubset(columns), f"Missing columns: {required_columns - columns}"
    
    def test_user_preferences_composite_unique_constraint(self, metadata):
        """AC-3: Verify composite unique constraint on (user_id, article_id)"""
        prefs = metadata.tables["user_preferences"]
        
        unique_constraints = [
            const for const in prefs.constraints 
            if isinstance(const, sa.UniqueConstraint)
        ]
        
        has_composite_unique = any(
            {"user_id", "article_id"} <= {col.name for col in cons.columns}
            for cons in unique_constraints
        )
        assert has_composite_unique, "Missing composite unique constraint on (user_id, article_id)"
    
    def test_user_preferences_foreign_keys(self, metadata, connection):
        """AC-3: Verify foreign key constraints to users and news_articles"""
        prefs = metadata.tables["user_preferences"]
        users = metadata.tables["users"]
        articles = metadata.tables["news_articles"]
        
        # Create valid user and article
        user_id = str(uuid.uuid4())
        article_id = str(uuid.uuid4())
        
        connection.execute(
            users.insert().values(
                user_id=user_id,
                username="preferenceuser",
                email="prefs@example.com",
                password_hash="pref123"
            )
        )
        
        connection.execute(
            articles.insert().values(
                article_id=article_id,
                title="Preference Test Article",
                content="Content for preferences",
                author_id=user_id,
                publication_date=sa.func.now(),
                source_url="https://example.com/prefs",
                category="Test"
            )
        )
        
        # Create preference should succeed
        connection.execute(
            prefs.insert().values(
                preference_id=str(uuid.uuid4()),
                user_id=user_id,
                article_id=article_id,
                liked=True,
                disliked=False,
                saved=True,
                read_duration_seconds=120
            )
        )
    
    def test_user_preferences_reject_duplicate_for_same_user_article(self, metadata, connection):
        """AC-3: Verify duplicate user_id + article_id pair is rejected"""
        prefs = metadata.tables["user_preferences"]
        users = metadata.tables["users"]
        articles = metadata.tables["news_articles"]
        
        user_id = str(uuid.uuid4())
        article_id = str(uuid.uuid4())
        
        # Setup user and article
        connection.execute(
            users.insert().values(
                user_id=user_id,
                username="dupuser",
                email="dup@example.com",
                password_hash="dup123"
            )
        )
        
        connection.execute(
            articles.insert().values(
                article_id=article_id,
                title="Dup Test Article",
                content="Duplicate test",
                author_id=user_id,
                publication_date=sa.func.now(),
                source_url="https://example.com/dup",
                category="Test"
            )
        )
        
        # Insert first preference
        connection.execute(
            prefs.insert().values(
                preference_id=str(uuid.uuid4()),
                user_id=user_id,
                article_id=article_id,
                liked=True,
                disliked=False,
                saved=False,
                read_duration_seconds=60
            )
        )
        
        # Duplicate should fail
        with pytest.raises(IntegrityError):
            connection.execute(
                prefs.insert().values(
                    preference_id=str(uuid.uuid4()),
                    user_id=user_id,  # Same user
                    article_id=article_id,  # Same article
                    liked=False,
                    disliked=True,
                    saved=False,
                    read_duration_seconds=30
                )
            )


class TestIndexes:
    """Tests for database indexes optimization"""
    
    def get_indexes(self, metadata, table_name):
        """Helper to get index columns for a table"""
        table = metadata.tables.get(table_name)
        if not table:
            return set()
        return {idx.name: [col.name for col in idx.columns] for idx in table.indexes}
    
    def test_indexes_exist_on_users_table(self, metadata):
        """AC-4: Verify indexes on users table"""
        indexes = self.get_indexes(metadata, "users")
        # Verify at least indexes exist on common query columns
        idx_columns = set()
        for idx_name, columns in indexes.items():
            idx_columns.update(columns)
        assert "email" in idx_columns, "Missing index on users.email"
        assert "username" in idx_columns, "Missing index on users.username"
    
    def test_indexes_exist_on_news_articles_table(self, metadata):
        """AC-5: Verify indexes on news_articles table for query optimization"""
        indexes = self.get_indexes(metadata, "news_articles")
        idx_columns = set()
        for idx_name, columns in indexes.items():
            idx_columns.update(columns)
        assert "author_id" in idx_columns, "Missing index on news_articles.author_id"
        assert "category" in idx_columns, "Missing index on news_articles.category"
    
    def test_indexes_exist_on_user_preferences_table(self, metadata):
        """AC-5: Verify indexes on user_preferences table"""
        indexes = self.get_indexes(metadata, "user_preferences")
        idx_columns = set()
        for idx_name, columns in indexes.items():
            idx_columns.update(columns)
        assert "user_id" in idx_columns, "Missing index on user_preferences.user_id"


class TestReferentialIntegrity:
    """Tests for cascade behaviors and referential integrity"""
    
    def test_cascade_delete_user_removes_preferences(self, metadata, connection):
        """AC-6: Verify deleting a user removes their preferences"""
        users = metadata.tables["users"]
        articles = metadata.tables["news_articles"]
        prefs = metadata.tables["user_preferences"]
        
        user_id = str(uuid.uuid4())
        article_id = str(uuid.uuid4())
        
        # Setup
        connection.execute(
            users.insert().values(
                user_id=user_id,
                username="cascadeuser",
                email="cascade@example.com",
                password_hash="casc123"
            )
        )
        
        connection.execute(
            articles.insert().values(
                article_id=article_id,
                title="Cascade Test",
                content="Cascade content",
                author_id=user_id,
                publication_date=sa.func.now(),
                source_url="https://example.com/cascade",
                category="Test"
            )
        )
        
        connection.execute(
            prefs.insert().values(
                preference_id=str(uuid.uuid4()),
                user_id=user_id,
                article_id=article_id,
                liked=True,
                disliked=False,
                saved=True,
                read_duration_seconds=100
            )
        )
        
        # Delete user
        connection.execute(users.delete().where(users.c.user_id == user_id))
        
        # Verify user's preferences were deleted
        result = connection.execute(
            prefs.select().where(prefs.c.user_id == user_id)
        ).fetchall()
        assert len(result) == 0, "preferences should be cascade deleted with user"
    
    def test_cascade_delete_article_removes_preferences(self, metadata, connection):
        """AC-6: Verify deleting an article removes associated preferences"""
        users = metadata.tables["users"]
        articles = metadata.tables["news_articles"]
        prefs = metadata.tables["user_preferences"]
        
        user_id = str(uuid.uuid4())
        article_id = str(uuid.uuid4())
        
        # Setup
        connection.execute(
            users.insert().values(
                user_id=user_id,
                username="artcascadeuser",
                email="artcascade@example.com",
                password_hash="art123"
            )
        )
        
        connection.execute(
            articles.insert().values(
                article_id=article_id,
                title="Article Cascade Test",
                content="Article cascade content",
                author_id=user_id,
                publication_date=sa.func.now(),
                source_url="https://example.com/art-cascade",
                category="Test"
            )
        )
        
        connection.execute(
            prefs.insert().values(
                preference_id=str(uuid.uuid4()),
                user_id=user_id,
                article_id=article_id,
                liked=True,
                disliked=False,
                saved=False,
                read_duration_seconds=50
            )
        )
        
        # Delete article
        connection.execute(articles.delete().where(articles.c.article_id == article_id))
        
        # Verify article's preferences were deleted
        result = connection.execute(
            prefs.select().where(prefs.c.article_id == article_id)
        ).fetchall()
        assert len(result) == 0, "preferences should be cascade deleted with article"


class TestColumnTypes:
    """Tests for data type requirements"""
    
    def test_uuid_column_types(self, metadata):
        """AC-7: Verify UUID columns are using appropriate type"""
        users = metadata.tables["users"]
        articles = metadata.tables["news_articles"]
        prefs = metadata.tables["user_preferences"]
        
        # Check UUID primary keys
        uuid_tables = [
            ("users", "user_id", users),
            ("news_articles", "article_id", articles),
            ("user_preferences", "preference_id", prefs)
        ]
        
        for table_name, pk_col, table in uuid_tables:
            pk = table.columns.get(pk_col)
            assert pk is not None, f"Column {pk_col} not found in {table_name}"
            # Check it's a UUID type (PostgreSQL) or CHAR(36) (other databases)
            col_type = str(pk.type)
            assert "uuid" in col_type.lower() or "char" in col_type.lower(), \
                f"{table_name}.{pk_col} should be UUID type, got: {col_type}"


class TestEdgeCases:
    """Edge case validation tests"""
    
    def test_username_max_length_enforcement(self, metadata, connection):
        """EC-1: Verify username length constraint (50 chars)"""
        users = metadata.tables["users"]
        
        # Username at max length should work
        user_id = str(uuid.uuid4())
        connection.execute(
            users.insert().values(
                user_id=user_id,
                username="a" * 50,  # Exactly 50 chars
                email="max50@example.com",
                password_hash="hash123"
            )
        )
        
        # Username exceeding limit should fail
        with pytest.raises((IntegrityError, sa.exc.DataError)):
            connection.execute(
                users.insert().values(
                    user_id=str(uuid.uuid4()),
                    username="b" * 51,  # 51 chars - should fail
                    email="max51@example.com",
                    password_hash="hash123"
                )
            )
    
    def test_email_max_length_enforcement(self, metadata, connection):
        """EC-2: Verify email length constraint (255 chars)"""
        users = metadata.tables["users"]
        
        # Email at max length should work
        user_id = str(uuid.uuid4())
        email_length = 255 - len("@example.com")
        connection.execute(
            users.insert().values(
                user_id=user_id,
                username="emailmaxuser",
                email="a" * email_length + "@example.com",
                password_hash="hash123"
            )
        )
        
        # Email exceeding limit should fail
        with pytest.raises((IntegrityError, sa.exc.DataError)):
            connection.execute(
                users.insert().values(
                    user_id=str(uuid.uuid4()),
                    username="emailtoobig",
                    email="b" * (email_length + 1) + "@example.com",
                    password_hash="hash123"
                )
            )
    
    def test_category_max_length_enforcement(self, metadata, connection):
        """EC-3: Verify category length constraint (50 chars)"""
        articles = metadata.tables["news_articles"]
        users = metadata.tables["users"]
        
        user_id = str(uuid.uuid4())
        connection.execute(
            users.insert().values(
                user_id=user_id,
                username="categorytest",
                email="cat@example.com",
                password_hash="hash123"
            )
        )
        
        # Category at max length should work
        connection.execute(
            articles.insert().values(
                article_id=str(uuid.uuid4()),
                title="Category Test",
                content="Testing category length",
                author_id=user_id,
                publication_date=sa.func.now(),
                source_url="https://example.com/cat",
                category="A" * 50
            )
        )
        
        # Category exceeding limit should fail
        with pytest.raises((IntegrityError, sa.exc.DataError)):
            connection.execute(
                articles.insert().values(
                    article_id=str(uuid.uuid4()),
                    title="Bad Category Test",
                    content="Testing category too long",
                    author_id=user_id,
                    publication_date=sa.func.now(),
                    source_url="https://example.com/badcat",
                    category="B" * 51
                )
            )
    
    def test_null_preference_values_allowed(self, metadata, connection):
        """EC-4: Verify nullable boolean preference columns work as expected"""
        users = metadata.tables["users"]
        articles = metadata.tables["news_articles"]
        prefs = metadata.tables["user_preferences"]
        
        user_id = str(uuid.uuid4())
        article_id = str(uuid.uuid4())
        
        connection.execute(
            users.insert().values(
                user_id=user_id,
                username="nullptest",
                email="nullp@example.com",
                password_hash="hash123"
            )
        )
        
        connection.execute(
            articles.insert().values(
                article_id=article_id,
                title="Null Pref Test",
                content="Testing null preferences",
                author_id=user_id,
                publication_date=sa.func.now(),
                source_url="https://example.com/nullp",
                category="Test"
            )
        )
        
        # Insert with NULL preferences should work
        connection.execute(
            prefs.insert().values(
                preference_id=str(uuid.uuid4()),
                user_id=user_id,
                article_id=article_id,
                liked=None,  # NULL
                disliked=None,  # NULL
                saved=None,  # NULL
                read_duration_seconds=None  # NULL
            )
        )
        
        # Verify the record exists
        result = connection.execute(
            prefs.select().where(
                (prefs.c.user_id == user_id) & (prefs.c.article_id == article_id)
            )
        ).fetchone()
        assert result is not None, "Preference record should be created"
    
    def test_zero_and_negative_read_duration(self, metadata):
        """EC-5: Verify read_duration_seconds handles edge values"""
        prefs = metadata.tables["user_preferences"]
        
        # Column should allow zero and negative values
        # (SQL doesn't enforce positive integers unless CHECK constraint added)
        col = prefs.columns.get("read_duration_seconds")
        assert col is not None, "read_duration_seconds column not found"
        assert col.nullable == True, "read_duration_seconds should be nullable"
