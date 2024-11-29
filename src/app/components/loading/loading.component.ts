import {Component, Input} from "@angular/core";
@Component({
	selector: "c-loading",
	template:`<div class = 'wrapper' [ngStyle]="{background}"><div class="loader"></div></div>`,
	styles: [`
		:host {
			width: 100%;
			height: 100%;
		}
        .wrapper {
            width: 100%;
	        height: 100%;
	        display: flex;
	        flex-direction: row;
	        justify-content: center;
	        align-items: center;
	        position: absolute;
	        top:0;
	        left: 0;
	        z-index: 2;
	        border-radius: 5px;
            opacity: 1 ;
        }
        .loader {
            width: 80px;
            aspect-ratio: 2;
            --c:linear-gradient(#FFD412 25%,#ABD406 0 50%,#FF821C 0 75%,#FFD412 0);
            background: var(--c), var(--c), var(--c), var(--c);
            background-size: 26% 400%;
            background-position: calc(0*100%/3) 100%,calc(1*100%/3) 100%,calc(2*100%/3) 100%,calc(3*100%/3) 100%;
            background-repeat: no-repeat;
            animation: l10 2s infinite;
        }
        @keyframes l10 {
            0%     {background-position: calc(0*100%/3) calc(3*100%/3),calc(1*100%/3) calc(3*100%/3),calc(2*100%/3) calc(3*100%/3),calc(3*100%/3) calc(3*100%/3)}
            8.33%  {background-position: calc(0*100%/3) calc(2*100%/3),calc(1*100%/3) calc(3*100%/3),calc(2*100%/3) calc(3*100%/3),calc(3*100%/3) calc(3*100%/3)}
            16.67% {background-position: calc(0*100%/3) calc(2*100%/3),calc(1*100%/3) calc(2*100%/3),calc(2*100%/3) calc(3*100%/3),calc(3*100%/3) calc(3*100%/3)}
            25%    {background-position: calc(0*100%/3) calc(2*100%/3),calc(1*100%/3) calc(2*100%/3),calc(2*100%/3) calc(2*100%/3),calc(3*100%/3) calc(3*100%/3)}
            30%,
            33.33% {background-position: calc(0*100%/3) calc(2*100%/3),calc(1*100%/3) calc(2*100%/3),calc(2*100%/3) calc(2*100%/3),calc(3*100%/3) calc(2*100%/3)}
            41.67% {background-position: calc(0*100%/3) calc(1*100%/3),calc(1*100%/3) calc(2*100%/3),calc(2*100%/3) calc(2*100%/3),calc(3*100%/3) calc(2*100%/3)}
            50%    {background-position: calc(0*100%/3) calc(1*100%/3),calc(1*100%/3) calc(1*100%/3),calc(2*100%/3) calc(2*100%/3),calc(3*100%/3) calc(2*100%/3)}
            58.33% {background-position: calc(0*100%/3) calc(1*100%/3),calc(1*100%/3) calc(1*100%/3),calc(2*100%/3) calc(1*100%/3),calc(3*100%/3) calc(2*100%/3)}
            63%,
            66.67% {background-position: calc(0*100%/3) calc(1*100%/3),calc(1*100%/3) calc(1*100%/3),calc(2*100%/3) calc(1*100%/3),calc(3*100%/3) calc(1*100%/3)}
            75%    {background-position: calc(0*100%/3) calc(0*100%/3),calc(1*100%/3) calc(1*100%/3),calc(2*100%/3) calc(1*100%/3),calc(3*100%/3) calc(1*100%/3)}
            83.33% {background-position: calc(0*100%/3) calc(0*100%/3),calc(1*100%/3) calc(0*100%/3),calc(2*100%/3) calc(1*100%/3),calc(3*100%/3) calc(1*100%/3)}
            91.67% {background-position: calc(0*100%/3) calc(0*100%/3),calc(1*100%/3) calc(0*100%/3),calc(2*100%/3) calc(0*100%/3),calc(3*100%/3) calc(1*100%/3)}
            97%,
            100%   {background-position: calc(0*100%/3) calc(0*100%/3),calc(1*100%/3) calc(0*100%/3),calc(2*100%/3) calc(0*100%/3),calc(3*100%/3) calc(0*100%/3)}
        }

	`]
})
export class LoadingComponent {
	@Input() background = 'transparent'
}
