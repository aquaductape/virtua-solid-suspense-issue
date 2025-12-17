import { useQuery } from '@tanstack/solid-query';
import { Component, createEffect, createSignal, Show } from 'solid-js';
import { fetchEntityDetail } from './EntityDetail';

// Types for your API response
export interface Entity {
	id: string;
	// Add your entity properties here
	name?: string;
	[key: string]: any;
}

export const EntityItem: Component<{
	entity: Entity;
	index: () => number;
	onClick?: (entity: Entity) => void;
}> = (props) => {
	const [showTooltip, setShowTooltip] = createSignal(false);
	let tooltipRef: HTMLDivElement | undefined;
	let buttonRef: HTMLButtonElement | undefined;

	// Query to fetch entity details
	const detailQuery = useQuery(() => ({
		queryKey: ['entityDetail', props.entity.id],
		queryFn: () => fetchEntityDetail(props.entity.id),
		enabled: showTooltip(), // Only fetch when tooltip is shown
	}));

	// Close tooltip when clicking outside
	const handleClickOutside = (e: MouseEvent) => {
		if (
			tooltipRef &&
			buttonRef &&
			!tooltipRef.contains(e.target as Node) &&
			!buttonRef.contains(e.target as Node)
		) {
			setShowTooltip(false);
		}
	};

	createEffect(() => {
		if (showTooltip()) {
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
	});

	createEffect(() => {
		if (showTooltip()) {
			console.log('detailQuery', detailQuery.data);
		}
	});

	return (
		<div
			data-entity-name={`Entity ${props.index() + 1}`}
			class="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
			classList={{
				'bg-slate-200': props.index() % 2 === 0,
			}}
			onClick={() => props.onClick?.(props.entity)}
		>
			<div class="flex items-start justify-between gap-2">
				<div class="flex-1">
					<div class="font-semibold">Entity {props.index() + 1}</div>
					<div class="text-sm text-gray-600">ID: {props.entity.id}</div>
					{props.entity.name && <div class="text-sm">{props.entity.name}</div>}
				</div>
				<div class="relative">
					<button
						ref={buttonRef}
						class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors relative z-10"
						onClick={(e) => {
							e.stopPropagation();
							setShowTooltip(!showTooltip());
						}}
						title="View details"
					>
						ℹ️
					</button>
					<Show when={showTooltip()}>
						<div
							ref={tooltipRef}
							class="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50"
							onClick={(e) => e.stopPropagation()}
						>
							<div class="space-y-2 text-sm">
								{detailQuery.isLoading && (
									<div class="text-gray-600">Loading...</div>
								)}
								{detailQuery.isError && (
									<div class="text-red-600">
										Error: {detailQuery.error?.message || 'Failed to load'}
									</div>
								)}
								{detailQuery.data && (
									<>
										<div class="font-semibold text-gray-900">
											{detailQuery.data.name || props.entity.id}
										</div>
										{detailQuery.data.description && (
											<div class="text-gray-600">
												{detailQuery.data.description}
											</div>
										)}
										{detailQuery.data.metadata && (
											<div class="text-gray-500 text-xs">
												Views: {detailQuery.data.metadata.views} • Likes:{' '}
												{detailQuery.data.metadata.likes} •{' '}
												{detailQuery.data.metadata.category}
											</div>
										)}
										{detailQuery.data.extraField1 && (
											<div class="text-gray-600 text-xs">
												{detailQuery.data.extraField1}
											</div>
										)}
									</>
								)}
							</div>
						</div>
					</Show>
				</div>
			</div>

			{/* Tooltip */}
		</div>
	);
};
