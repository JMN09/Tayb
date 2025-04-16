# backend/app/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Text, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    password_hash = Column(String(200))
    is_restaurant = Column(Boolean, default=False)

    # Add relationship to Review
    reviews = relationship("Review", back_populates="user")

    def __repr__(self):
        return f"<User id={self.id} username={self.username} is_restaurant={self.is_restaurant}>"


class Cuisine(Base):
    __tablename__ = "cuisines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    image_url = Column(String(255))

    # Relationship to Restaurant
    restaurants = relationship("Restaurant", back_populates="cuisine")


class Restaurant(Base):
    __tablename__ = "restaurants"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(100), nullable=False)
    location    = Column(String(100))          # e.g. "Hamra"
    image_url   = Column(String(255))
    rating      = Column(Integer, default=0)
    description = Column(Text)                 # 🆕 free‑text
    latitude    = Column(Float)                # 🆕 map coord
    longitude   = Column(Float)                # 🆕 map coord

    cuisine_id  = Column(Integer, ForeignKey("cuisines.id"), nullable=False)
    cuisine     = relationship("Cuisine", back_populates="restaurants")
    
    # Add relationship to Review
    reviews = relationship("Review", back_populates="restaurant")

    def __repr__(self):
        return f"<Restaurant id={self.id} name={self.name}>"

    def __json__(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "image_url": self.image_url,
            "rating": self.rating,
            "description": self.description,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "cuisine_id": self.cuisine_id,
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

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5 star rating
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="reviews")
    restaurant = relationship("Restaurant", back_populates="reviews")
    
    def __repr__(self):
        return f"<Review id={self.id} user_id={self.user_id} restaurant_id={self.restaurant_id} rating={self.rating}>"
    
    def __json__(self):
        return {
            "id": self.id,
            "content": self.content,
            "rating": self.rating,
            "created_at": self.created_at.isoformat(),
            "user_id": self.user_id,
            "restaurant_id": self.restaurant_id,
            "username": self.user.username if self.user else None
        }