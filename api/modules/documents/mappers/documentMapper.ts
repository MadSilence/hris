import type { DocumentDTO, DocumentFolderContentDTO, DocumentFolderDTO, } from "@/api/modules/documents/dto";

export class DocumentMapper {
  public mapDocumentDTO(dto: DocumentDTO): DocumentDTO {
    return dto;
  }

  public mapFolderDTO(dto: DocumentFolderDTO): DocumentFolderDTO {
    return dto;
  }

  public mapFolderContentDTO(dto: DocumentFolderContentDTO): DocumentFolderContentDTO {
    return {
      ...dto,
      folders: dto.folders.map((folder) => this.mapFolderDTO(folder)),
      documents: dto.documents.map((doc) => this.mapDocumentDTO(doc)),
    };
  }
}

export const documentMapper = new DocumentMapper();
