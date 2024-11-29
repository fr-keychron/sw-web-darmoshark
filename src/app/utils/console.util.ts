export class ConsoleUtil {
	static colorfulLog (s: string , set = 'background: #222; color: #bada55' ) {
		console.log( `%c ${s}` , set )
	}
}
