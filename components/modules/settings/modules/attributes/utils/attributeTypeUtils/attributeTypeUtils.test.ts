import { getAttributeTypeLabel } from "@/components/modules/settings/modules/attributes/utils/attributeTypeUtils/attributeTypeUtils";
import { AttributeType } from "@/models/attribute";

describe("attributeTypeUtils", () => {
  describe("getAttributeTypeLabel", () => {
    it("should return correct label for TEXT", () => {
      const result = getAttributeTypeLabel(AttributeType.TEXT);
      expect(result).toEqual("Text");
    });

    it("should return correct label for SELECT", () => {
      const result = getAttributeTypeLabel(AttributeType.SELECT);
      expect(result).toEqual("Select");
    });

    it("should return correct label for STATUS", () => {
      const result = getAttributeTypeLabel(AttributeType.STATUS);
      expect(result).toEqual("Status");
    });

    it("should return correct label for PERSON", () => {
      const result = getAttributeTypeLabel(AttributeType.PERSON);
      expect(result).toEqual("Person");
    });

    it("should return correct label for CHECKBOX", () => {
      const result = getAttributeTypeLabel(AttributeType.CHECKBOX);
      expect(result).toEqual("Checkbox");
    });

    it("should return correct label for NUMBER", () => {
      const result = getAttributeTypeLabel(AttributeType.NUMBER);
      expect(result).toEqual("Number");
    });

    it("should return correct label for MULTI_SELECT", () => {
      const result = getAttributeTypeLabel(AttributeType.MULTI_SELECT);
      expect(result).toEqual("Multi select");
    });

    it("should return correct label for DATE", () => {
      const result = getAttributeTypeLabel(AttributeType.DATE);
      expect(result).toEqual("Date");
    });

    it("should return correct label for EMAIL", () => {
      const result = getAttributeTypeLabel(AttributeType.EMAIL);
      expect(result).toEqual("Email");
    });

    it("should return correct label for URL", () => {
      const result = getAttributeTypeLabel(AttributeType.URL);
      expect(result).toEqual("URL");
    });
  });
});
