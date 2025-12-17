import { useQuery } from '@tanstack/solid-query';
import { Component, Show } from 'solid-js';
import { Entity } from './EntityItem';

interface EntityDetailData {
	id: string;
	name?: string;
	description?: string;
	// Extra fields that come from the detail API
	extraField1?: string;
	extraField2?: string;
	createdAt?: string;
	updatedAt?: string;
	[key: string]: any;
}

// Mock API function to fetch entity details
export async function fetchEntityDetail(
	entityId: string
): Promise<EntityDetailData> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 1500));

	// Extract number from entity ID (e.g., "entity-1" -> 1)
	const num = parseInt(entityId.replace('entity-', ''), 10);

	// Return mock detailed data
	return {
		id: entityId,
		name: `Entity ${num}`,
		description: `This is entity number ${num} in the list`,
		extraField1: `Extra data field 1 for entity ${num}`,
		extraField2: `Extra data field 2 for entity ${num}`,
		createdAt: new Date(Date.now() - num * 86400000).toISOString(),
		updatedAt: new Date().toISOString(),
		metadata: {
			views: num * 10,
			likes: Math.floor(num / 2),
			category: num % 2 === 0 ? 'Category A' : 'Category B',
		},
	};
}

interface EntityDetailProps {
	entity: Entity;
	onBack: () => void;
}

const EntityDetail: Component<EntityDetailProps> = (props) => {
	const query = useQuery(() => ({
		queryKey: ['entityDetail', props.entity.id],
		queryFn: () => fetchEntityDetail(props.entity.id),
	}));

	return (
		<div class="h-full flex flex-col">
			{/* Header with back button */}
			<div class="flex items-center gap-2 p-3 bg-gray-100 border-b border-gray-300">
				<button
					onClick={props.onBack}
					class="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
				>
					← Back
				</button>
				<h2 class="text-lg font-semibold text-gray-800">Entity Details</h2>
			</div>

			{/* Entity content */}
			<div class="flex-1 overflow-auto p-6">
				<Show
					when={!query.isLoading && !query.isError}
					fallback={
						<div class="flex items-center justify-center h-full">
							{query.isLoading && (
								<div class="text-gray-600">Loading entity details...</div>
							)}
							{query.isError && (
								<div class="text-red-600">
									Error:{' '}
									{query.error?.message || 'Failed to load entity details'}
								</div>
							)}
						</div>
					}
				>
					{(data) => {
						const entityData = query.data!;
						return (
							<div class="space-y-4">
								{/* Basic info from entity prop */}
								<div>
									<div class="text-sm font-medium text-gray-500">ID</div>
									<div class="text-lg font-semibold text-gray-900">
										{props.entity.id}
									</div>
								</div>
								{props.entity.name && (
									<div>
										<div class="text-sm font-medium text-gray-500">Name</div>
										<div class="text-lg text-gray-900">{props.entity.name}</div>
									</div>
								)}

								{/* Extra data from query */}
								{entityData.extraField1 && (
									<div>
										<div class="text-sm font-medium text-gray-500">
											Extra Field 1
										</div>
										<div class="text-gray-700">{entityData.extraField1}</div>
									</div>
								)}
								{entityData.extraField2 && (
									<div>
										<div class="text-sm font-medium text-gray-500">
											Extra Field 2
										</div>
										<div class="text-gray-700">{entityData.extraField2}</div>
									</div>
								)}
								{entityData.createdAt && (
									<div>
										<div class="text-sm font-medium text-gray-500">
											Created At
										</div>
										<div class="text-gray-700">
											{new Date(entityData.createdAt).toLocaleString()}
										</div>
									</div>
								)}
								{entityData.updatedAt && (
									<div>
										<div class="text-sm font-medium text-gray-500">
											Updated At
										</div>
										<div class="text-gray-700">
											{new Date(entityData.updatedAt).toLocaleString()}
										</div>
									</div>
								)}
								{entityData.metadata && (
									<div>
										<div class="text-sm font-medium text-gray-500">
											Metadata
										</div>
										<div class="text-gray-700">
											<div>Views: {entityData.metadata.views}</div>
											<div>Likes: {entityData.metadata.likes}</div>
											<div>Category: {entityData.metadata.category}</div>
										</div>
									</div>
								)}
								{entityData.description && (
									<div>
										<div class="text-sm font-medium text-gray-500">
											Description
										</div>
										<div class="text-gray-700">{entityData.description}</div>
									</div>
								)}
							</div>
						);
					}}
				</Show>
			</div>
		</div>
	);
};

export default EntityDetail;
