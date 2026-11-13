import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Page Imports
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import HomeFeed from './pages/HomeFeed';
import CreateThought from './pages/CreateThought';
import ThoughtDetails from './pages/ThoughtDetails';
import RandomDiscovery from './pages/RandomDiscovery';
import DiscussionRooms from './pages/DiscussionRooms';
import LiveRoomChat from './pages/LiveRoomChat';
import CommunityInsights from './pages/CommunityInsights';
import SavedThoughts from './pages/SavedThoughts';
import UserSettings from './pages/UserSettings';
import AdminModeration from './pages/AdminModeration';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Main 13 Application Routes */}
          <Route index element={<Landing />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
          <Route path="feed" element={<HomeFeed />} />
          <Route path="create" element={<CreateThought />} />
          <Route path="thought/:id" element={<ThoughtDetails />} />
          <Route path="thoughts/:id" element={<ThoughtDetails />} />
          <Route path="discover" element={<RandomDiscovery />} />
          <Route path="rooms" element={<DiscussionRooms />} />
          <Route path="rooms/:id" element={<LiveRoomChat />} />
          <Route path="insights" element={<CommunityInsights />} />
          <Route path="saved" element={<SavedThoughts />} />
          <Route path="settings" element={<UserSettings />} />
          <Route path="admin" element={<AdminModeration />} />

          {/* Fallback 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
