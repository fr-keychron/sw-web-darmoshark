
export interface IResult {
	success: boolean ;
	msg: string ;
	data: any
}
export class Result implements  IResult {
	success = false ;
	msg = ''
	data: any = null

	constructor(d?: IResult) {
		if(d && d.success) this.success = d.success
		if(d && d.msg) this.msg = d.msg
		if(d && d.data ) this.data = d.data
	}

	static build(d?: IResult)  {
		return new Result(d)
	}

	setSuccess (d: boolean): this {
		this.success = d ;
		return this
	}

	setMsg (d: string): this {
		this.msg = d ;
		return this
	}

	setData( d: any ): this {
		this.data = d ;
		return this
	}

	error( s: string): this {
		this.success = false
		return this.setSuccess(false).setMsg(s)
	}

	succeed(d?: any , s? : string ): this {
		if( d ) this.data = d ;
		if( s ) this.msg = s ;
		return this.setSuccess(true)
	}
}
