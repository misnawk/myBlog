import React from 'react';
import { Container } from '@mui/material';
import HeroSection from '../components/home/HeroSection';
import TodoAlert from '../components/home/TodoAlert';
import RecentPosts from '../components/home/RecentPosts';
import PopularCategories from '../components/home/PopularCategories';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { useHomeData } from '../components/home/useHomeData';

function Home() {
  const {
    recentPosts,
    popularCategories,
    loading,
    error,
    todoAlert,
    setTodoAlert
  } = useHomeData();

  if (loading) return <LoadingState message="데이터를 불러오는 중..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <HeroSection />

      <TodoAlert
        todoAlert={todoAlert}
        onClose={() => setTodoAlert(null)}
      />

      <RecentPosts posts={recentPosts} />

      <PopularCategories categories={popularCategories} />
    </Container>
  );
}

export default Home;
