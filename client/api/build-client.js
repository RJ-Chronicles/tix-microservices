import axios from 'axios';

export default ({ req }) => {

  console.log('build-client called');
  console.log('req headers:', req ? req.headers : 'no req');
  if (typeof window === 'undefined') {
    // We are on the server — talk directly to the auth service inside the cluster
    return axios.create({
      baseURL: 'http://auth-srv:3000',
      headers: req.headers,
    });
  } else {
    // We must be in the browser
    return axios.create({
      baseURL: 'https://ticketing.dev',
    });
  }
};
