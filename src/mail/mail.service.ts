import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async taskDeadlineNotify(email: string, description: string, deadline: string) {
    const template = {
      to: email,
      from: 'PM with love',
      subject: 'Kindly remind you of upcoming deadline',
      html: `<b>You have upcoming deadline of task: "${description}" on ${deadline}</b>`
    }
    await this.mailerService.sendMail(template)
  }

  async taskAssignedNotify(email: string, description: string, deadline: string) {
    const template = {
      to: email,
      from: 'PM with love',
      subject: 'You have a new task',
      html: `<b>You have a new task: "${description}" with deadline on ${deadline}</b>`
    }
    await this.mailerService.sendMail(template)
  }

  async projectAssignedNotify(email: string, name: string, start_date: string) {
    const template = {
      to: email,
      from: 'PM with love',
      subject: 'You are assigned to a new project',
      html: `<b>You are assigned to a new project "${name}" start from ${start_date}</b>`
    }
    await this.mailerService.sendMail(template)
  }
}
