import {
	trigger,
	animate,
	transition,
	style,
	query,
} from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
	transition('* => *', [
		query(':enter', [style({opacity: 0})], {
			optional: true,
		}),
		query(
			':leave',
			[
				style({opacity: 1}),
				animate('0.3s', style({opacity: 0})),
			],
			{optional: true}
		),
		query(
			':enter',
			[
				style({opacity: 0}),
				animate('0.3s', style({opacity: 1})),
			],
			{optional: true}
		),
	]),
]);

export const ifAnimation = trigger(
	'inOutAnimation',
	[
		transition(
			':enter',
			[
				style({opacity: 0}),
				animate('1s ease-out',
					style({opacity: 1}))
			]
		),
		transition(
			':leave',
			[
				style({opacity: 1}),
				animate('1s ease-in',
					style({opacity: 0}))
			]
		)
	]
)
