
import 'typeface-roboto';
import React, { useState, useEffect, Suspense } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useWeb3React } from '@web3-react/core'
import { useEagerConnect, useInactiveListener } from 'utils/hooks.js'
import { Switch, Route, withRouter } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import loadable from '@loadable/component';
import { SnackbarProvider } from 'notistack';
import pMinDelay from 'p-min-delay';

import theme from 'styles/theme';
import Layout from 'hoc/Layout';
import { AppContext } from 'contexts';
import { PAGES } from 'utils/links/pages';
import WalletModal from 'components/WalletModal';
import ClimbLoading from 'components/ClimbLoading'
import Notifications from 'components/Notifications';

const DELAY_TIME = 100;
const Home = loadable(() => pMinDelay(import('containers/Home'), DELAY_TIME));

const useStyles = makeStyles(() => ({
  primaryTextColor: {
    color: '#fff'
  }
}));

const App = () => {
  const classes = useStyles();
  const context = useWeb3React();
  const { connector, library, chainId, account, deactivate, active } = context;
  const [isWalletDialog, setIsWalletDialog] = useState();
  const [activatingConnector, setActivatingConnector] = useState();
  const [balance, setBalance] = useState()

  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])

  useEffect(() => {
    if (!!account && !!library) {
      let stale = false

      library
        .getBalance(account)
        .then((balance) => {
          if (!stale) {
            setBalance(balance)
          }
        })
        .catch(() => {
          if (!stale) {
            setBalance(null)
          }
        })

      return () => {
        stale = true
        setBalance(undefined)
      }
    }
  }, [account, library, chainId])

  const triedEager = useEagerConnect();
  useInactiveListener(!triedEager || !!activatingConnector)

  const [loadingInfo, setLoadingInfo] = useState(false);
  const [layout] = useState(false)

  const openCloseDialogHandler = show => () => {
    setIsWalletDialog(show)
  }

  useEffect(() => {
    if (isWalletDialog) {
      document.body.style.overflow = 'hidden';
    }
    else {
      document.body.style.overflow = 'unset';
    }
  }, [isWalletDialog])

  return (
    <AppContext.Provider
      value={{
        loadingInfo,
        library,
        active,
        setLoadingInfo,
        setIsWalletDialog,
        account,
        chainId,
        deactivate,
        balance
      }}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider
          classes={{
            variantSuccess: classes.primaryTextColor,
            variantError: classes.primaryTextColor,
            variantWarning: classes.primaryTextColor,
            variantInfo: classes.primaryTextColor
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          maxSnack={3}>
          <CssBaseline />
          <Notifications notifications={''} notificationType={'success'} />
          <Suspense fallback={<ClimbLoading wholeOverlay />}>
            <Layout layout={layout} account={account}>
              {
                isWalletDialog &&
                <WalletModal
                  headerTitle={'Connecting a Wallet'}
                  open={true}
                  onClose={openCloseDialogHandler(false)}
                  setActivatingConnector={setActivatingConnector}
                  activatingConnector={activatingConnector}
                  triedEager={triedEager}
                  context={context}
                />
              }
              <Switch>
                <Route render={() => (
                  account ?
                    <Switch>
                      <Route exact path={PAGES.HOME.url} component={Home} />
                    </Switch>
                    :
                    <Switch>
                      <Route exact path={PAGES.HOME.url} component={Home} />
                    </Switch>
                )} />
              </Switch>
            </Layout>
          </Suspense>
        </SnackbarProvider>
      </ThemeProvider>
    </AppContext.Provider>
  )
};

export default withRouter(App);