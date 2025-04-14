# backend/app/models.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    password_hash = Column(String(200))

    def __repr__(self):
        return f"<User id={self.id} username={self.username}>"

class Cuisine(Base):
    __tablename__ = "cuisines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    image_url = Column(String(255))

    # Relationship to Restaurant
    restaurants = relationship("Restaurant", back_populates="cuisine")


class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    location = Column(String(100))
    image_url = Column(String(255))
    rating = Column(Integer, default=0)

    cuisine_id = Column(Integer, ForeignKey("cuisines.id"), nullable=False)

    # Relationship to Cuisine
    cuisine = relationship("Cuisine", back_populates="restaurants")

    def __repr__(self):
        return f"<Restaurant id={self.id} name={self.name}>"

    def __json__(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "image_url": self.image_url,
            "rating": self.rating,
            "cuisine_id": self.cuisine_id
        }


class Banner(Base):
    __tablename__ = "banners"

    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String(255), nullable=False)
    order = Column(Integer, default=0)  # position in carousel

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    restaurant_id = Column(Integer, nullable=False)