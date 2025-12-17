import { useQuery } from '@tanstack/solid-query';
import {
	Component,
	createEffect,
	createMemo,
	createSignal,
	on,
	onCleanup,
	onMount,
	Show,
	useTransition,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import { VirtualizerHandle, VList } from 'virtua/solid';
import { fetchEntityDetail } from './EntityDetail';
import { Entity, EntityItem } from './EntityItem';

interface PanelProps {
	list: Entity[];
	onFetchMore: () => void;
	onEntityClick?: (entity: Entity) => void;
	isLoading?: boolean;
	isError?: boolean;
	error?: Error | null;
	panelId?: string;
}

const PanelVirtualList: Component<PanelProps> = (props) => {
	return (
		<div class="flex h-full w-full">
			<div
				class="flex-1 overflow-hidden scrollbar-hidden"
				data-unified-entity-list
			>
				<VList data={props.list}>
					{(entity: Entity, index: () => number) => {
						const currentIndex = index();
						const totalItems = props.list.length;

						// Fetch more when scrolling past 90% of the list
						if (currentIndex >= Math.floor(totalItems * 0.9)) {
							props.onFetchMore();
						}

						return (
							<EntityItem
								entity={entity}
								index={index}
								onClick={props.onEntityClick}
							/>
						);
					}}
				</VList>
			</div>
		</div>
	);
};

export default PanelVirtualList;
