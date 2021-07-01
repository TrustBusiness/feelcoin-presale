
import React, { useState, useCallback, useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Typography, Grid, useMediaQuery } from '@material-ui/core';
import Slide from '@material-ui/core/Slide';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import SwapHorizontalCircleIcon from '@material-ui/icons/SwapHorizontalCircle';
import { AttachMoneyRounded } from '@material-ui/icons';
import { MaxUint256 } from '@ethersproject/constants';
import { useSnackbar } from 'notistack';
import Chip from '@material-ui/core/Chip';

import CircleButton from 'components/UI/Buttons/CircleButton';
import RadiusButton from 'components/RadiusButton';
import ContainedButton from 'components/UI/Buttons/ContainedButton';
import { MemoizedOutlinedTextField } from 'components/UI/OutlinedTextField';
import ProgressBar from 'components/UI/ProgressBar';
import ClimbLoading from 'components/ClimbLoading';
import CustomizedStepper from 'components/UI/CustomizedStepper';
import { presaleInstance } from 'services/presaleInstance';
import { busdTokenInstance } from 'services/busdTokenInstance';
import { presaleContractAddress } from 'constants/contractAddresses';
import { isEmpty, delay } from 'utils/utility';
import PaypalBtn from 'react-paypal-checkout';
import { sandbox_client_id, paypal_client_id } from 'constants/apiKey';

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.default,
        border: `solid 0.5px ${theme.palette.text.secondary}`,
        margin: theme.spacing(0.5),
        borderRadius: '20px'
    },
    dialogTitleContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row !important'
    },
    dialogActions: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: theme.spacing(3),
        marginRight: -theme.spacing(2 / 8)
    },
    avatar: {
        backgroundColor: 'transparent',
        border: `2px solid ${theme.palette.text.secondary}`,
        height: theme.spacing(9),
        width: theme.spacing(9),
        marginRight: theme.spacing(1)
    },
    chipConatiner: {
        padding: theme.spacing(2.5, 1, 2.5, 1)
    },
    chip: {
        margin: theme.spacing(.5),
        backgroundColor: theme.palette.text.hoverText
    },
    titleLine: {
        marginBottom: theme.spacing(2.5)
    },
    dialogContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        width: '100%'
    },
    button: {
        border: 'none',
        background: 'linear-gradient(125deg, #06352d, #36f3d2 80%)',
        width: '100% !important'
    },
    dialogActionContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        marginLeft: 0,
        padding: theme.spacing(3)
    },
    selectContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 8
    },
    loading: {
        width: 'auto !important',
        height: 'auto !important'

    }
}));
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const SwapDialog = ({ onClose, account, chainId, library }) => {
    const classes = useStyles();
    const presaleTotalCount = 5000000;
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const [tokenPrice, setTokenPrice] = useState(0.0676);
    const [tokenUsdPrice, setTokenUsdPrice] = useState(0.0676);
    const presale = presaleInstance(account, chainId, library);
    const busdToken = busdTokenInstance(account, chainId, library);
    const [activeStep, setActiveStep] = useState(0);
    const [tokenSaleProgress, setTokenSaleProgress] = useState(0);
    const [yourFEELCOINBalance, setYourFEELCOINBalance] = useState(0);
    const [yourBUSDBalance, setYourBUSDBalance] = useState(0);
    const [currency, setCurrency] = useState('BUSD');
    const isSm = useMediaQuery(theme.breakpoints.down('sm'), {
        defaultMatches: true,
    });

    const [open] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [state, setState] = useState({
        busdValue: 0,
        feelcoinValue: 0
    });

    const [isSwapBtnDisplay, setSwapBtnDisplay] = useState('flex');
    const [isPaypalBtnDisplay, setPaypalBtnDisplay] = useState(false);

    useEffect(() => {
        try {
            const initialize = async () => {
                const tokenRate = await presale.getRewardTokenCount() / 1e18
                setTokenUsdPrice(tokenRate);
                const yourMNTNBalance = await presale.balanceOf(account) / 1e18
                const yourBUSDBalance = await busdToken.balanceOf(account) / 1e18
                setTokenSaleProgress(parseFloat(yourMNTNBalance * 100 / presaleTotalCount).toFixed(6))
                setYourFEELCOINBalance(yourMNTNBalance);
                setYourBUSDBalance(yourBUSDBalance);
            }
    
            if (!isEmpty(presale) && !isEmpty(account)) {
                initialize();
            }
        }
        catch (error) {
            console.log('kevin inital data error ===>', error)
        }

    }, [presale, account, busdToken])

    const inputChangeHandler = useCallback(event => {
        const { name, value } = event.target;
        if (name === 'busdValue') {
            setState(prevState => ({
                ...prevState, [name]: value, 'feelcoinValue': value / tokenPrice
            }));
        } else {
            setState(prevState => ({
                ...prevState, [name]: value, 'busdValue': value * tokenPrice
            }));
        }
    }, [tokenPrice]);

    const approveHandler = async () => {
        if (state.busdValue <= 0) {
            enqueueSnackbar(`BUSD is insufficient to buy FEELCOIN`, { variant: 'error' });
            return
        }
        setLoadingStatus(true)
        try {
            let loop = true;
            let tx = null;
            const allowedTokens = await busdToken.allowance(account, presaleContractAddress);
            // console.log(parseInt(allowedTokens));
            if (parseInt(allowedTokens) / 1e18 <= state.busdValue) {
                const { hash: approveHash } = await busdToken.approve(`${presaleContractAddress}`, MaxUint256);
                while (loop) {
                    tx = await library.getTransactionReceipt(approveHash);
                    console.log('kevin transaction tx', tx)
                    if (isEmpty(tx)) {
                        await delay(300)
                    } else {
                        loop = false
                    }
                }
                if (tx.status === 1) {
                    setLoadingStatus(false)
                    setActiveStep(1)
                    return;
                }
            }
            else {
                setLoadingStatus(false)
                setActiveStep(1)
            }
        }
        catch (error) {
            enqueueSnackbar(`Approve error ${error?.data?.message}`, { variant: 'error' });
            setLoadingStatus(false)
            console.log('kevin===>', error)
        }
    }

    const onPaypalSuccess = async (payment) => {
        console.log("The payment successed!", payment);
        setLoadingStatus(true)
        try{
            let loop = true
            let tx = null
            const { hash: depositByFiat } = await presale.depositByFiat(`${state.busdValue * 1e18}`,`${account}`)
            while (loop) {
                tx = await library.getTransactionReceipt(depositByFiat)
                if(isEmpty(tx)) {
                    await delay(300)
                } else {
                    loop = false
                } 
            }
            if (tx.status === 1) {
                setActiveStep(0)
                setLoadingStatus(false)
                enqueueSnackbar(`Swap has been successfully processed!`, { variant: 'success' });
                return;
            }
        }
        catch(error) {
            console.log('kevin===>', error)
            enqueueSnackbar(`Swap error ${error?.data?.message}`, { variant: 'error' });
            setLoadingStatus(false)
            setActiveStep(0)
        }
    }

    const onPaypalCancel = (data) => {
        console.log("The payment cancelled!", data);
    }

    const onPaypalError = (err) => {
        console.log("The payment Error!", err);
    }

    const swapHandler = async () => {
        if (state.busdValue <= 0) {
            enqueueSnackbar(`BUSD is insufficient to buy FEELCOIN`, { variant: 'error' });
            return
        }

        setLoadingStatus(true)
        try {
            let loop = true;
            let tx = null;
            const { hash: depositHash } = await presale.depositByBusd(`${state.busdValue * 1e18}`);
            console.log(depositHash);
            while (loop) {
                tx = await library.getTransactionReceipt(depositHash);
                console.log('kevin deposit transaction tx', tx)
                if (isEmpty(tx)) {
                    await delay(300)
                } else {
                    loop = false
                }
            }
            if (tx.status === 1) {
                setActiveStep(0)
                setLoadingStatus(false)
                enqueueSnackbar(`Swap has been successfully processed!`, { variant: 'success' });
                return;
            }
        }
        catch (error) {
            console.log('kevin===>', error)
            enqueueSnackbar(`Swap error ${error?.data?.message}`, { variant: 'error' });
            setLoadingStatus(false)
            setActiveStep(0)
        }
    }

    const chipClickHandler = () => {
        setState(prevState => ({
            ...prevState, 'busdValue': yourBUSDBalance, 'feelcoinValue': yourBUSDBalance / tokenPrice
        }));
    }

    const setCurrencyHandler = (currency) => {
        setCurrency(currency)
        
        if(currency === 'USD'){
            setActiveStep(1)
            setSwapBtnDisplay('none')
            setPaypalBtnDisplay(true)
        } else {
            setActiveStep(0)
            setSwapBtnDisplay('flex');
            setPaypalBtnDisplay(false);
        }

        setState(prevState => ({
            ...prevState, 'busdValue': state.busdValue, 'feelcoinValue': state.busdValue / tokenUsdPrice
        }));
        setTokenPrice(tokenUsdPrice)        
    }

    const clientID = {
        sandbox: sandbox_client_id,
        production: paypal_client_id,
    }
    const style = {
        'label':'paypal', 
        'tagline': false, 
        'size':'medium', 
        'shape':'pill', 
        'color':'gold'
    }

    return (
        <div>
            <Dialog classes={{ paper: classes.root }}
                disableEnforceFocus fullScreen={isSm ? true : false}
                maxWidth={'lg'} open={open}
                TransitionComponent={Transition} >
                <DialogTitle>
                    <div className={classes.dialogTitleContainer}>
                        <Typography variant='h6' color='textSecondary'>Your Wallet :
                            <b style={{ color: '#F0B90B' }}> {yourBUSDBalance.toFixed(3)} </b> (BUSD) , <b style={{ color: '#E93929' }}>{yourFEELCOINBalance.toFixed(3)}</b> (FEELCOINS) </Typography>
                        <CircleButton
                            style={{ backgroundColor: '#1B1F2E' }} onClick={onClose}
                            icon={<CloseIcon style={{ color: theme.palette.text.primary }} fontSize='default' />} />
                    </div>
                </DialogTitle>
                <DialogContent classes={{ root: classes.dialogContent }}>
                    <Typography component='div' variant='body1'
                        style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        BUY FEELCOIN TOKENS WITH BUSD
                        <Typography color='textSecondary' variant='h6' >
                            MAX: 5000000 FEELCOIN
                        </Typography>
                    </Typography>
                    <Grid container spacing={2} alignItems='center' justify='center' direction='row' style={{ marginBottom: 5 }}>
                        <Grid item xs={12} md={5} style={{ width: '100%' }}>
                            <Grid container spacing={0} alignItems='center' justify='center' direction='row'>
                                <Grid item xs={12} md={4} style={{ width: '100%' }}>
                                    <ContainedButton style={{ paddingLeft: '6px', paddingRight: '10px' }} onClick={() => setCurrencyHandler('BUSD')}>
                                        <img width='22px' height='20px' src='/assets/images/BUSD.png' alt='BUSD' />
                                        <Typography variant='subtitle2' style={{ marginLeft: 5 }}>BUSD</Typography>
                                    </ContainedButton>
                                </Grid>
                                <Grid item xs={12} md={4} style={{ width: '100%' }}>
                                    <ContainedButton style={{ paddingLeft: '6px', paddingRight: '10px', width: '80px' }} onClick={() => setCurrencyHandler('USD')}>
                                        <AttachMoneyRounded></AttachMoneyRounded>
                                        <Typography variant='subtitle2' style={{ marginLeft: 5 }}>USD</Typography>
                                    </ContainedButton>
                                </Grid>
                            </Grid>                      
                        </Grid>
                        <Grid item xs={12} md={3} style={{ width: '100%' }}></Grid>
                        <Grid item xs={12} md={4} style={{ width: '100%' }}>
                        <Typography variant='h6' color='textSecondary'>PRICE :   
                            <b style={{ color: '#E93929' }}> {tokenPrice.toFixed(4)}</b><b style={{ color: '#F0B90B' }}> {currency}</b></Typography>
                        </Grid>
                    </Grid>
                    
                    <Grid container spacing={2} alignItems='center' justify='center' direction={isSm ? 'column' : 'row'}>
                        <Grid item xs={12} md={5} style={{ width: '100%' }}>
                            <MemoizedOutlinedTextField
                                placeholder={currency}
                                name={'busdValue'}
                                type="number"
                                value={state.busdValue}
                                onChange={inputChangeHandler}
                                endAdornment={<> <Chip label="MAX" onClick={chipClickHandler} clickable color="primary" /><img width='42px' height='40px' src={`/assets/images/${currency}.png`} alt='BUSD' /> </>}
                            /></Grid>
                        <Grid item xs={12} md={2} container alignItems='center' justify='center' style={{ width: '100%' }}>
                            {loadingStatus ? <ClimbLoading width={32} classes={{ root: classes.loading }} />
                                :
                                <>
                                    {isSm ?
                                        <SwapVertIcon fontSize='large' />
                                        :
                                        <SwapHorizIcon fontSize='large' />
                                    }
                                </>
                            }
                        </Grid>
                        <Grid item xs={12} md={5} style={{ width: '100%' }}>
                            <MemoizedOutlinedTextField
                                placeholder='FEELCOIN'
                                type="number"
                                name={'feelcoinValue'}
                                value={state.feelcoinValue}
                                onChange={inputChangeHandler}
                                endAdornment={<img width='35px' height='35px' src='/assets/images/FEELCOIN.png' alt='FEELCOIN' />}
                            />
                        </Grid>
                        <Grid item xs={12} style={{ width: '100%' }}>
                            <CustomizedStepper
                                activeStep={activeStep}
                                setActiveStep={setActiveStep}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions disableSpacing classes={{ root: classes.dialogActionContainer }} >
                    <RadiusButton style={{ margin: '0px', display: `${isSwapBtnDisplay}`}}
                        loading={loadingStatus}
                        onClick={() => activeStep === 0 ? approveHandler() : swapHandler()} variant='outlined'
                        className={classes.button} fullWidth={true}>
                        {activeStep === 0
                            ? <VerifiedUserIcon style={{ marginRight: 8 }} />
                            : <SwapHorizontalCircleIcon style={{ marginRight: 8 }} />}
                        <Typography variant='h6'>
                            {activeStep === 0 ? 'Approve' : 'Swap'}
                        </Typography>
                    </RadiusButton>
                    {isPaypalBtnDisplay? <PaypalBtn env='sandbox' total={parseFloat(state.busdValue)} currency={currency} client={clientID} style={style} onError={onPaypalError} onSuccess={onPaypalSuccess} onCancel={onPaypalCancel}></PaypalBtn>:''}
                    <Grid item xs={12} style={{ width: '100%', marginTop: 20 }}>
                        <ProgressBar tokenSaleProgress={parseFloat(tokenSaleProgress)} />
                    </Grid>
                </DialogActions >
            </Dialog>
        </div>
    );
}

export default SwapDialog;