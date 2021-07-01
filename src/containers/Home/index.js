
import React, { useContext, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppContext } from 'contexts';
import AOS from 'aos';
import 'aos/dist/aos.css';
import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-lazy-load-image-component/src/effects/opacity.css';

import Section from 'hoc/Section';
import Hero from './Hero';
import SwapDialog from 'components/UI/SwapDialog';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage: 'url(/assets/images/homeBackground.jpg)'
  },
}));

const Home = () => {
  const classes = useStyles();
  const { account, library, chainId } = useContext(AppContext);
  const [isSwapDialog, setIsSwapDialog] = useState(false);

  AOS.init({
    once: true,
    delay: 50,
    duration: 500,
    easing: 'ease-in-out',
  });

  const closeHandler = () => {
    setIsSwapDialog(false)
  }

  return (
    <div className={classes.root}>
      <Section >
        <Hero
          setIsSwapDialog={setIsSwapDialog}
          account={account} />
      </Section>
      {isSwapDialog &&
        <SwapDialog
          onClose={closeHandler}
          account={account}
          chainId={chainId}
          library={library} />}
    </div >
  );
};

export default Home;
