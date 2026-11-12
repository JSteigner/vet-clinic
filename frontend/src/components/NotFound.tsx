import { Link } from 'react-router';

const NotFound = ({ what = 'Page' }: { what?: string }) => (
  <div className="py-16 text-center">
    <h1 className="text-xl font-semibold">{what} not found</h1>
    <Link to="/" className="mt-4 inline-block text-teal-700 hover:underline">
      Back to the schedule
    </Link>
  </div>
);

export default NotFound;
