"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertySector = exports.PropertyType = void 0;
var PropertyType;
(function (PropertyType) {
    PropertyType["APARTMENT"] = "apartment";
    PropertyType["HOUSE"] = "house";
    PropertyType["RETAIL"] = "retail";
    PropertyType["LAND"] = "land";
    PropertyType["INDUSTRIAL"] = "industrial";
})(PropertyType || (exports.PropertyType = PropertyType = {}));
var PropertySector;
(function (PropertySector) {
    PropertySector["RESIDENTIAL"] = "residential";
    PropertySector["COMMERCIAL"] = "commercial";
    PropertySector["INDUSTRIAL"] = "industrial";
    PropertySector["AGRICULTURAL"] = "agricultural";
})(PropertySector || (exports.PropertySector = PropertySector = {}));
