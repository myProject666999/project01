import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { Guest } from './entities/guest.entity';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';

@Injectable()
export class GuestService {
  constructor(
    @InjectRepository(Guest)
    private guestRepository: Repository<Guest>,
  ) {}

  async findAll() {
    return this.guestRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findByExhibition(exhibitionId: number) {
    return this.guestRepository.find({
      where: { exhibitionId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const guest = await this.guestRepository.findOne({ where: { id } });
    if (!guest) {
      throw new NotFoundException(`Guest #${id} not found`);
    }
    return guest;
  }

  async create(createGuestDto: CreateGuestDto) {
    const qrcodeToken = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const guest = this.guestRepository.create({
      ...createGuestDto,
      qrcodeToken,
    });
    return this.guestRepository.save(guest);
  }

  async update(id: number, updateGuestDto: UpdateGuestDto) {
    const guest = await this.findOne(id);
    Object.assign(guest, updateGuestDto);
    return this.guestRepository.save(guest);
  }

  async remove(id: number) {
    const guest = await this.findOne(id);
    await this.guestRepository.remove(guest);
    return { message: 'Guest deleted successfully' };
  }

  async checkin(id: number, method: 'qrcode' | 'face' | 'manual') {
    const guest = await this.findOne(id);
    if (guest.checkinStatus === 'checked_in') {
      return { message: 'Guest already checked in', guest };
    }
    guest.checkinStatus = 'checked_in';
    guest.checkinAt = new Date();
    guest.checkinMethod = method;
    return this.guestRepository.save(guest);
  }

  async getQrCode(id: number) {
    const guest = await this.findOne(id);
    const qrDataUrl = await QRCode.toDataURL(guest.qrcodeToken);
    return { qrcode: qrDataUrl, token: guest.qrcodeToken };
  }

  async getCheckinStats(exhibitionId: number) {
    const total = await this.guestRepository.count({ where: { exhibitionId } });
    const checkedIn = await this.guestRepository.count({
      where: { exhibitionId, checkinStatus: 'checked_in' },
    });
    return { total, checkedIn, notCheckedIn: total - checkedIn };
  }
}
