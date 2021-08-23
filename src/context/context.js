import React, { useState, useEffect, useContext } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

const GithubContext = React.createContext();

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);

  const [requests, setRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // error
  const [error, setError] = useState({ show: false, msg: '' });

  // check rate
  const checkRequests = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios(`${rootUrl}/rate_limit`);
      let {
        rate: { remaining },
      } = data;
      setRequests(remaining);
      if (remaining === 0) {
        toggleError(true, 'sorry, you have exceeded your hourly rate limit!');
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  const toggleError = (show, msg) => {
    setError({ show, msg });
  };

  const searchUser = async (user) => {
    setIsLoading(true);
    const getUser = async () => {
      try {
        let { data } = await axios(`${rootUrl}/users/${user}`);
        setGithubUser(data);
      } catch (error) {
        console.log(error);
        toggleError(true, 'There is no user');
      }
    };
    const getRepos = async () => {
      try {
        let { data } = await axios(
          `${rootUrl}/users/${user}/repos?per_page=100`
        );
        setRepos(data);
      } catch (error) {
        console.log(error);
        toggleError(true, 'There is no user');
      }
    };
    const getFollower = async () => {
      try {
        let { data } = await axios(`${rootUrl}/users/${user}/followers`);
        setFollowers(data);
      } catch (error) {
        console.log(error);
        toggleError(true, 'There is no user');
      }
    };
    await Promise.all([getUser(), getRepos(), getFollower()]);
    setIsLoading(false);
  };

  useEffect(() => {
    checkRequests();
  }, []);

  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        requests,
        error,
        searchUser,
        isLoading,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

const useGlobalContext = () => {
  return useContext(GithubContext);
};

export { GithubProvider, useGlobalContext };
