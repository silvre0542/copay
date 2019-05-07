import { Injectable } from '@angular/core';

// Providers
import { BwcProvider } from '../../providers/bwc/bwc';

@Injectable()
export class AddressProvider {
  private bitcore;
  private bitcoreCash;
  private Bitcore;
  private bitcoreDiamond;

  constructor(private bwcProvider: BwcProvider) {
    this.bitcore = this.bwcProvider.getBitcore();
    this.bitcoreCash = this.bwcProvider.getBitcoreCash();
    this.bitcoreDiamond = this.bwcProvider.getBitcoreDiamond();
    this.Bitcore = {
      btc: {
        lib: this.bitcore,
        translateTo: 'bch'
      },
      bch: {
        lib: this.bitcoreCash,
        translateTo: 'btc'
      }
    };
  }

  public getCoin(str: string): string {
    const address = this.extractAddress(str);
    try {
      new this.Bitcore['btc'].lib.Address(address);
      return 'btc';
    } catch (e) {
      try {
        new this.Bitcore['bch'].lib.Address(address);
        return 'bch';
      } catch (e) {
        return null;
      }
    }
  }

  public getNetwork(str: string): string {
    const address = this.extractAddress(str);
    let network;
    try {
      network = this.bwcProvider.getBitcore().Address(address).network.name;
    } catch (e) {
      try {
        network = this.bwcProvider.getBitcoreCash().Address(address).network
          .name;
      } catch (e) {}
    }
    return network;
  }

  public checkCoinAndNetworkFromAddr(
    coin: string,
    network: string,
    str: string
  ): boolean {
    if (this.isValid(str)) {
      const address = this.extractAddress(str);
      return (this.getCoin(address) == coin  || (this.getCoin(address) == 'btc' && coin == 'bcd')) &&
        this.getNetwork(address) == network
        ? true
        : false;
    } else {
      return false;
    }
  }

  public checkCoinAndNetworkFromPayPro(
    coin: string,
    network: string,
    payProDetails
  ): boolean {
    return payProDetails.coin == coin && payProDetails.network == network
      ? true
      : false;
  }

  public extractAddress(str: string): string {
    const extractedAddress = str
      .replace(/^(bitcoincash:|bchtest:|bitcoin:|bitcoindiamond:)/i, '')
      .replace(/\?.*/, '');
    return extractedAddress;
  }

  public isValid(str: string): boolean {
    // Check if the input is a valid uri or address
    const URI = this.bitcore.URI;
    const Address = this.bitcore.Address;
    const URICash = this.bitcoreCash.URI;
    const AddressCash = this.bitcoreCash.Address;
    const URIDiamond = this.bitcoreDiamond.URI;

    // Bip21 uri
    let uri, uriAddress;
    if (/^bitcoin:/.test(str)) {
      if (URI.isValid(str)) {
        uri = new URI(str);
        uriAddress = uri.address.toString();
        if (Address.isValid(uriAddress, 'livenet')) return true;
        if (Address.isValid(uriAddress, 'testnet')) return true;
      }
    }
    else if (/^bitcoindiamond:/.test(str)) {
      if (this.bitcoreDiamond.URI.isValid(str)) {
        uri = new URIDiamond(str);
        uriAddress = uri.address.toString();
        if (this.bitcoreDiamond.Address.isValid(uriAddress, 'livenet')) return true;
        if (this.bitcoreDiamond.Address.isValid(uriAddress, 'testnet')) return true;
      }
    } else if (/^bitcoincash:/i.test(str) || /^bchtest:/i.test(str)) {
      if (URICash.isValid(str)) {
        uri = new URICash(str);
        uriAddress = uri.address.toString();
        if (AddressCash.isValid(uriAddress, 'livenet')) return true;
        if (AddressCash.isValid(uriAddress, 'testnet')) return true;
      }
    }

    // Regular Address: try Bitcoin and Bitcoin Cash
    if (Address.isValid(str, 'livenet')) return true;
    if (Address.isValid(str, 'testnet')) return true;
    if (AddressCash.isValid(str, 'livenet')) return true;
    if (AddressCash.isValid(str, 'testnet')) return true;

    return false;
  }
}
