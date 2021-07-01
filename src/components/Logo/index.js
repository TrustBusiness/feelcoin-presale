
import ClimbImage from 'components/ClimbImage';

const sources = [
  {
    srcSet: '/assets/logo/feelcoin.ico 600w, /assets/logo/feelcoin.ico 960w, /assets/logo/feelcoin.ico 1280w',
    type: 'image/png'
  },
  {
    srcSet: '/assets/logo/feelcoin.ico 600w, /assets/logo/feelcoin.ico 960w, /assets/logo/feelcoin.ico',
    type: 'image/png'
  }
];

const Logo = props => (
  <ClimbImage
    {...props}
    width={44}
    height={44}
    sources={sources} />
);

export default Logo;
