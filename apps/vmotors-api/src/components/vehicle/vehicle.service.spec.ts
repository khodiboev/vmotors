jest.mock('../../libs/config', () => ({
	lookupAuthMemberLiked: jest.fn(),
	lookupMember: {},
	shapeIntoMongoObjectId: (target: unknown) => target,
}));

import { VehicleService } from './vehicle.service';
import { VehicleStatus } from '../../libs/enums/vehicle.enum';

const execResult = <T>(value: T) => ({
	exec: jest.fn().mockResolvedValue(value),
});

describe('VehicleService', () => {
	let vehicleModel: Record<string, jest.Mock>;
	let memberService: Record<string, jest.Mock>;
	let service: VehicleService;

	beforeEach(() => {
		vehicleModel = {
			create: jest.fn(),
			findOneAndUpdate: jest.fn(),
		};
		memberService = {
			memberStatsEditor: jest.fn().mockResolvedValue({}),
		};

		service = new VehicleService(vehicleModel as any, memberService as any, {} as any, {} as any);
	});

	it('increments memberVehicles when a dealer creates a vehicle', async () => {
		const input = { memberId: 'dealer-id', vehicleModel: 'Sonata' };
		const created = { _id: 'vehicle-id', ...input };
		vehicleModel.create.mockResolvedValue(created);

		await expect(service.createVehicle(input as any)).resolves.toEqual(created);

		expect(memberService.memberStatsEditor).toHaveBeenCalledWith({
			_id: 'dealer-id',
			targetKey: 'memberVehicles',
			modifier: 1,
		});
	});

	it('sets soldAt when updating a vehicle to SOLD', async () => {
		const updated = { _id: 'vehicle-id', vehicleStatus: VehicleStatus.SOLD };
		vehicleModel.findOneAndUpdate.mockReturnValue(execResult(updated));

		await expect(
			service.updateVehicle('dealer-id' as any, {
				_id: 'vehicle-id' as any,
				vehicleStatus: VehicleStatus.SOLD,
			}),
		).resolves.toEqual(updated);

		const update = vehicleModel.findOneAndUpdate.mock.calls[0][1];
		expect(update.soldAt).toBeInstanceOf(Date);
		expect(memberService.memberStatsEditor).not.toHaveBeenCalled();
	});

	it('soft-deletes vehicles and decrements memberVehicles during admin removal', async () => {
		const removed = { _id: 'vehicle-id', memberId: 'dealer-id' };
		vehicleModel.findOneAndUpdate.mockReturnValue(execResult(removed));

		await expect(service.removeVehicleByAdmin('vehicle-id' as any)).resolves.toEqual(removed);

		const [search, update] = vehicleModel.findOneAndUpdate.mock.calls[0];
		expect(search).toEqual({ _id: 'vehicle-id', deletedAt: { $exists: false } });
		expect(update.deletedAt).toBeInstanceOf(Date);
		expect(memberService.memberStatsEditor).toHaveBeenCalledWith({
			_id: 'dealer-id',
			targetKey: 'memberVehicles',
			modifier: -1,
		});
	});
});
