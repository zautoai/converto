import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateFormBuilderDto } from './dto/create-form-builder.dto';
import { UpdateFormBuilderDto } from './dto/update-form-builder.dto';
import { PrismaClientManager } from 'src/prisma/prismaClientManager.service';
import { readFile } from 'fs/promises';
import { ContactsService } from 'src/contacts/contacts.service';
const { minify } = require('uglify-js');

@Injectable()
export class FormBuilderService {
  private logger = new Logger(FormBuilderService.name);

  constructor(
    private readonly prismaClientManager: PrismaClientManager,
    private readonly contactService: ContactsService,
  ) {}

  async create(orgId: string, createFormBuilderDto: CreateFormBuilderDto) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    let leadForm;
    try {
      const fields = createFormBuilderDto.createLeadField;
      delete createFormBuilderDto.createLeadField;
      leadForm = await prisma.leadForm.create({
        data: createFormBuilderDto,
      });

      if (fields) {
        for (const field of fields) {
          await prisma.leadFormField.create({
            data: {
              leadFormId: leadForm.id,
              type: field.type,
              ...field,
            },
          });
        }
      }
    } catch (error) {
      if (leadForm) {
        await prisma.leadForm.delete({
          where: {
            id: leadForm.id,
          },
        });
      }
      throw error;
    }
    return {
      code: 200,
      success: true,
      message: 'Form created successfully',
    };
  }

  async findAll(orgId: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    const forms = await prisma.leadForm.findMany({
      include: {
        LeadFormField: true,
      },
    });
    return {
      code: 200,
      success: true,
      message: 'Forms fetched successfully',
      data: forms,
    };
  }

  async findOne(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    const form = await prisma.leadForm.findUnique({
      where: {
        id: id,
      },
      include: {
        LeadFormField: true,
      },
    });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    return {
      code: 200,
      success: true,
      message: 'Form fetched successfully',
      data: form,
    };
  }

  async update(
    orgId: string,
    id: string,
    updateFormBuilderDto: UpdateFormBuilderDto,
  ) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    try {
      const updateFields = updateFormBuilderDto.updateLeadField;
      delete updateFormBuilderDto.updateLeadField;
      await prisma.leadForm.update({
        where: { id },
        data: updateFormBuilderDto,
      });
      await prisma.leadFormField.deleteMany({
        where: { leadFormId: id },
      });
      if (updateFields) {
        for (const field of updateFields) {
          await prisma.leadFormField.create({
            data: {
              leadFormId: id,
              type: field.type,
              label: field.label,
              isRequired: field.isRequired,
              contactField: field.contactField,
            },
          });
        }
      }
    } catch (error) {
      throw error;
    }

    return {
      code: 200,
      success: true,
      message: 'Form updated successfully',
    };
  }

  async remove(orgId: string, id: string) {
    const prisma = await this.prismaClientManager.getClient(orgId);
    await prisma.leadForm.delete({ where: { id } });
    return {
      code: 204,
      success: true,
      message: 'Form deleted successfully',
    };
  }

  async generateFormScript(orgId: string, id: string): Promise<string> {
    if (!id.includes('.js')) {
      throw new NotFoundException('Form not found');
    }
    id = id.replace('.js', '');
    try {
      const filePath = `./src/common/scripts/form.js`;
      let content = await readFile(filePath, 'utf-8');
      const formId = `form_${id.replace(' ', '')}`;
      const apiEndpoint = `${process.env.HOST}/api/v1/form-builder/${orgId}/form/submit/${id}`;
      content = content.replace('{{formId}}', formId);
      content = content.replace('{{apiEndpoint}}', apiEndpoint);
      const uglifiedCode = minify(content).code;
      return uglifiedCode;
    } catch (error) {
      throw error;
    }
  }

  async generateFormHTML(orgId: string, id: string): Promise<any> {
    const prisma = await this.prismaClientManager.getClient(orgId);
    const form = await prisma.leadForm.findUnique({
      where: {
        id: id,
      },
      include: {
        LeadFormField: true,
      },
    });
    const formId = `form_${id.replace(' ', '')}`;
    let formHTML = `<form id='${formId}'>`;
    formHTML += `<h2>${form.title}</h2>`;
    formHTML += `<p>${form.description}</p>`;
    const formFields = form.LeadFormField;
    formFields.forEach((field) => {
      formHTML += `<div>`;
      formHTML += `<label>${field.label}</label>`;
      if (field.isRequired) {
        formHTML +=
          field.type === 'TEXTAREA'
            ? `<textarea name="${field.contactField}" required></textarea>`
            : `<input type="${field.type.toLowerCase()}" name="${field.contactField}" required>`;
      } else {
        formHTML +=
          field.type === 'TEXTAREA'
            ? `<textarea name="${field.contactField}"></textarea>`
            : `<input type="${field.type.toLowerCase()}" name="${field.contactField}">`;
      }
      formHTML += `</div>`;
    });
    formHTML += `<button type="submit">Submit</button>`;
    formHTML += '</form>';
    return formHTML;
    // return {
    //   code:200,
    //   message: 'Form HTML generated successfully',
    //   data: formHTML
    // };
  }

  async submitForm(orgId: string, id: string, formData: any) {
    await this.findOne(orgId, id);
    await this.contactService.createContact(orgId, formData);
    return {
      code: 200,
      message: 'Form submitted successfully',
    };
  }
}
