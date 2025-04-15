import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import StarIcon from "@mui/icons-material/Star";
import { getRestaurants } from "../services/api";

interface Restaurant {
  id: number;
  name: string;
  image_url: string;
  rating: number;
  location: string;
}

const StarRating: React.FC<{ value: number }> = ({ value }) => (
  <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <StarIcon
        key={i}
        fontSize="small"
        color={i < value ? "warning" : "disabled"}
      />
    ))}
  </Box>
);

export const RestaurantsGallery: React.FC = () => {
    console.log("HERE")
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        console.log("Here")
        const data = await getRestaurants() as any;

        setRestaurants(data);
        console.log(data)
      } catch (err) {
        console.log("Here")
        console.error("Failed to fetch restaurants", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Typography align="center" sx={{ mt: 4 }}>Loading restaurants…</Typography>;

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", px: 2, py: 6 }}>
      <Grid container spacing={3} justifyContent="center">
        {restaurants.map((r) => (
          <Grid item key={r.id} xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ maxWidth: 300, mx: "auto" }}>
              <CardMedia component="img" height="160" image={r.image_url} alt={r.name} />
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" component="div" fontWeight={600}>
                  {r.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  {r.location}
                </Typography>
                <StarRating value={r.rating} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RestaurantsGallery;
