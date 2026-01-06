import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are NOT signed in</h1>
  );
};

LandingPage.getInitialProps = async context => {
  try {
    const client = buildClient(context);
    const { data } = await client.get('/api/users/currentuser');
    return data;
  } catch (err) {
    console.log('Error fetching current user in LandingPage:', err);
    // If auth service returns 404 or is temporarily unavailable, return no user instead of crashing
    return { currentUser: null };
  }
};

export default LandingPage;
