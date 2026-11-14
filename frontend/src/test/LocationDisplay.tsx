import { useLocation } from 'react-router';

/** Renders the current path and query, so tests can assert where a page navigated. */
const LocationDisplay = () => {
  const { pathname, search } = useLocation();

  return <p data-testid="location">{`${pathname}${search}`}</p>;
};

export default LocationDisplay;
