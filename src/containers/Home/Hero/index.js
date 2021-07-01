import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useMediaQuery, Grid } from '@material-ui/core';
import { useSnackbar } from 'notistack';

import ContainedButton from 'components/UI/Buttons/ContainedButton';
import Image from 'components/UI/Image';
import SectionHeader from 'components/UI/SectionHeader';

const useStyles = makeStyles(theme => ({
  root: {},
  image: {
    boxShadow:
      '25px 60px 125px -25px rgba(80,102,144,.1), 16px 40px 75px -40px rgba(0,0,0,.2)',
    borderRadius: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      maxWidth: 500,
      marginBottom: 60
    },
  },
  mobileImageContainer: {
    [theme.breakpoints.down('sm')]: {
      position: 'absolute', left: 0, marginTop: 80,
    },
    position: 'absolute', right: 0, marginTop: 80,
  },
  buyFeelCoinButton: {
    backgroundColor: theme.palette.error.light
  }
}));

const Hero = props => {
  const { setIsSwapDialog, account, className, ...rest } = props;
  const classes = useStyles();
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true,
  });
  const { enqueueSnackbar } = useSnackbar();

  const getTokenHandler = () => {
    if (account) {
      setIsSwapDialog(true)
    }
    else {
      enqueueSnackbar('Please connect your wallet', { variant: 'warning' })
    }
  }

  return (
    <div className={clsx(classes.root, className)} {...rest}>
      <Grid
        container
        justify="space-between"
        spacing={4}
        direction={isMd ? 'row' : 'column-reverse'}
      >
        <Grid
          item
          container
          alignItems="center"
          xs={12}
          md={6}
          data-aos={'fade-up'}
        >
          <SectionHeader
            title={
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: theme.palette.text.primary, fontSize: 18 }}>
                  Presale for
                </span>
                <span style={{ color: theme.palette.error.light }}>
                  FEELCOIN TOKEN    <Image
                    src="assets/images/FEELCOIN.png"
                    alt="Web3 Legal Engineering"
                    height={32}
                    width={32}
                    data-aos="zoom-in-down"
                    data-aos-easing="ease-out-cubic"
                    data-aos-duration="2000"
                  />
                  <br />
                </span>
                <span style={{ color: theme.palette.text.primary, fontSize: 18, fontWeight: '300', textAlign: 'justify', lineHeight: 1.8 }}>
                  Get profits through an exclusive limited offer token :<b> FEELCOIN </b>.
                  <br />
                  <br />
                </span>
                <span style={{ color: theme.palette.text.primary, fontSize: 18, fontWeight: '300', textAlign: 'justify', lineHeight: 1.8 }}>
                  Updated <b> deflationary </b> DeFi protocol, with the purpose of rewarding users with more dividends and a new financial structure to make the price increase.
                  <br />
                  <br />
                </span>
                <span style={{ color: theme.palette.text.primary, fontSize: 20 }}>
                  First Exchange-Traded Token Fund (ETTF) and deflationary protocol.
                  <br />
                  <br />
                </span>
                <span style={{ color: theme.palette.text.primary, fontSize: 18, fontWeight: '300', textAlign: 'justify', lineHeight: 1.8 }}>
                  We work on the highest performing platforms of DeFi, Yield Farms, Staking, Lending, Trading, Stock Market Tokens and Investments. With the optimal management of <b>buybacks, burns and liquidity,</b>  and the objective that the price of FEELCOIN only increases with the<b> best financial strategies with our deflationary protocol v2.</b>
                </span>
              </div>
            }
            // subtitle="Superpowers for Any Currency"
            ctaGroup={[
              <ContainedButton className={classes.buyFeelCoinButton} onClick={getTokenHandler} variant="contained" size="large">
                BUY FEELCOIN NOW!
              </ContainedButton>,
              <ContainedButton variant="outlined" color="primary" size="large">
                Learn more
              </ContainedButton>,
            ]}
            align={isMd ? "left" : 'center'}
            disableGutter
            titleVariant="h3"
          />
        </Grid>
        <Grid
          item
          container
          justify="flex-start"
          alignItems="center"
          xs={12}
          md={6}
          data-aos={'fade-up'}
        >
          <Image
            src="assets/images/FEELCOIN.png"
            alt="Web3 Legal Engineering"
            className={classes.image}
            data-aos="fade-right"
            data-aos-easing="ease-out-cubic"
            data-aos-duration="2000"
          />
          <div className={classes.mobileImageContainer}>
            <Image
              src="assets/images/marketMobileDashboard.png"
              alt="Web3 Legal Engineering"
              className={classes.image}
              data-aos="fade-left"
              data-aos-easing="ease-out-cubic"
              data-aos-duration="2000"
            />
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

Hero.propTypes = {
  /**
   * External classes
   */
  className: PropTypes.string,
};

export default Hero;
