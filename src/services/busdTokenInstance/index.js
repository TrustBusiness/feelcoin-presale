
import { Contract } from '@ethersproject/contracts'

import { busdABI } from '../../abis/busd';
import { busdContractAddress } from '../../constants/contractAddresses';

const busdTokenInstance = (account, chainId, library) => {

    if (chainId) {
        return new Contract(busdContractAddress, busdABI, library.getSigner(account));
    }
    return null
}

export {
    busdTokenInstance
}
