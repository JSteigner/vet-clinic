import { Link, useLocation } from 'react-router';

import { PRIMARY_BUTTON } from '../../components/styles';
import { bookingHref } from './bookingHref';

/** The header's Book appointment button, filled in from the current page. */
const BookingLink = () => {
  const { pathname, search } = useLocation();

  return (
    <Link to={bookingHref(pathname, search)} className={`${PRIMARY_BUTTON} whitespace-nowrap`}>
      Book appointment
    </Link>
  );
};

export default BookingLink;
