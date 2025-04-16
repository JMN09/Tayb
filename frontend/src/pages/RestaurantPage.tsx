import React, { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Grid,
  Paper,
  Rating,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import Navbar from "../components/Navbar";
import { getRestaurantById, getRestaurantReviews, Restaurant, Review } from "../services/api";

const RestaurantPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const restaurantId = parseInt(id, 10);
        
        // Fetch restaurant details
        const restaurantData = await getRestaurantById(restaurantId);
        setRestaurant(restaurantData);
        
        // Fetch reviews
        const reviewsData = await getRestaurantReviews(restaurantId);
        setReviews(reviewsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load restaurant data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <Container sx={{ mt: 4, textAlign: "center" }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading restaurant details...
          </Typography>
        </Container>
      </>
    );
  }

  if (error || !restaurant) {
    return (
      <>
        <Navbar />
        <Container sx={{ mt: 4 }}>
          <Alert severity="error">{error || "Restaurant not found"}</Alert>
          <Button 
            component={RouterLink} 
            to="/browse" 
            variant="contained" 
            sx={{ mt: 2 }}
          >
            Back to Restaurants
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {/* Restaurant Card */}
        <Card sx={{ mb: 4 }}>
          <CardMedia
            component="img"
            height="300"
            image={restaurant.image_url}
            alt={restaurant.name}
          />
          <CardContent>
            <Typography variant="h4" component="h1" gutterBottom>
              {restaurant.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {restaurant.location}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={restaurant.rating} readOnly precision={0.5} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                ({reviews.length} reviews)
              </Typography>
            </Box>
            {restaurant.description && (
              <Typography variant="body1" paragraph>
                {restaurant.description}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Typography variant="h5" component="h2" gutterBottom>
          Reviews
        </Typography>
        <Divider sx={{ mb: 4 }} />

        {/* Review List */}
        {reviews.length > 0 ? (
          <Grid container spacing={3}>
            {reviews.map((review) => (
              <Grid item xs={12} key={review.id}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {review.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(review.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Rating value={review.rating} readOnly precision={0.5} sx={{ mb: 1 }} />
                  <Typography variant="body1">{review.content}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
            No reviews available for this restaurant.
          </Typography>
        )}
      </Container>
    </>
  );
};

export default RestaurantPage; 