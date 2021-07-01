export const setupNetwork = async () => {
    const provider = window.ethereum
    if (provider) {
      const chainId = parseInt(process.env.REACT_APP_CHAIN_ID, 10);
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: process.env.REACT_APP_CHAIN_NAME,
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18,
              },
              rpcUrls: process.env.REACT_APP_NODE,
              blockExplorerUrls: [`${process.env.BASE_BSC_SCAN_URL}/`],
            },
          ],
        })
        return true
      } catch (error) {
        console.error(error)
        return false
      }
    } else {
      console.error("Can't setup the BSC network on metamask because window.ethereum is undefined")
      return false
    }
  }