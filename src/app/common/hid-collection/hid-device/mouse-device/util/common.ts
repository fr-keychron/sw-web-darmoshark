export class VersionFactory {
  static rules: Array<{rule: (s: number|string) => boolean , instance: (device:any) => any }> = []
  static inject(rule: (s: number|string) => boolean , instance: any ) {
    VersionFactory.rules.push({rule , instance})
  }

  get(name: number|string, device: any): any {
    const r = VersionFactory.rules.find( i => i.rule(name) )
    if( r ) {
      return r.instance(device) ;
    }
    return null 
  }
}
export const versionFactory = new VersionFactory()