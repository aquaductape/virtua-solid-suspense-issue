import { useInfiniteQuery } from '@tanstack/solid-query';
import {
	Component,
	createEffect,
	createSignal,
	JSXElement,
	onCleanup,
	Show,
	Suspense,
	useContext,
	useTransition,
} from 'solid-js';
import EntityDetail from './EntityDetail';
import PanelVirtualList from './PanelVirtualList';

// Types for your API response
interface Entity {
	id: string;
	// Add your entity properties here
	name?: string;
	[key: string]: any;
}

interface PaginatedResponse {
	data: Entity[];
	nextCursor: string | null;
	hasMore: boolean;
}

// Hard-coded mock data
const MOCK_ENTITIES: Entity[] = Array.from({ length: 500 }, (_, i) => ({
	id: `entity-${i + 1}`,
	name: `Entity ${i + 1}`,
	description: `This is entity number ${i + 1} in the list`,
}));

const ITEMS_PER_PAGE = 20;

// Mock API function with hard-coded data
async function fetchEntities(
	cursor: string | null
): Promise<PaginatedResponse> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 300));

	const startIndex = cursor ? parseInt(cursor, 10) : 0;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const pageData = MOCK_ENTITIES.slice(startIndex, endIndex);

	const nextCursor =
		endIndex < MOCK_ENTITIES.length ? endIndex.toString() : null;

	return {
		data: pageData,
		nextCursor,
		hasMore: nextCursor !== null,
	};
}

// Wrapper component that manages the query for each panel
const PanelContainer: Component<{ id: string }> = (props) => {
	const [selectedEntity, setSelectedEntity] = createSignal<Entity | null>(null);

	const query = useInfiniteQuery(() => ({
		queryKey: ['entities', props.id],
		queryFn: ({ pageParam }) => fetchEntities(pageParam),
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		staleTime: 0,
	}));

	// Flatten all pages into a single array for VList
	const list = () => {
		const pages = query.data?.pages || [];
		return pages.flatMap((page) => page.data);
	};

	// Function to fetch more when scrolling near the end
	const fetchMore = () => {
		if (query.hasNextPage && !query.isFetchingNextPage) {
			query.fetchNextPage();
		}
	};

	// Debounced version
	let fetchTimeout: number | undefined;
	const debouncedFetchMore = () => {
		if (fetchTimeout) clearTimeout(fetchTimeout);
		fetchTimeout = setTimeout(fetchMore, 200);
	};

	const handleEntityClick = (entity: Entity) => {
		setSelectedEntity(entity);
	};

	const handleBack = () => {
		setSelectedEntity(null);
	};

	const SuspenseFallback = () => {
		return (
			<div class="bg-red-500 text-white">
				WRAPPED BY SUPSPENSE!!!!!!! LOADING......
			</div>
		);
	};

	return (
		<div class="h-full flex flex-col">
			<Suspense fallback={<SuspenseFallback />}>
				<div class="flex-1">
					<Show
						when={selectedEntity()}
						fallback={
							<PanelVirtualList
								list={list()}
								onFetchMore={debouncedFetchMore}
								onEntityClick={handleEntityClick}
								isLoading={query.isLoading}
								isError={query.isError}
								error={query.error}
								panelId={props.id}
							/>
						}
					>
						<EntityDetail entity={selectedEntity()!} onBack={handleBack} />
					</Show>
				</div>
			</Suspense>
		</div>
	);
};

export default PanelContainer;
