import prisma from "../../config/prismaClient.js";
import jwt from "jsonwebtoken";
import { STATUS_CODES } from "../../constants/statusCodesConstant.js";
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import {sendEmail} from '../../services/emailService.js';
import multer from "multer";
import csvParser from "csv-parser";
import fs from "fs";
import nodemailer from "nodemailer";

const upload = multer({ dest: "uploads/" });

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidDate = (date) => !isNaN(Date.parse(date));
  
  const logErrorToFile = (message) => {
    const timestamp = new Date().toISOString();
    fs.appendFileSync("invalid_rows.log", `[${timestamp}] ${message}\n`);
  };



export const createBulkAgency = async (req, res) => {

    try {
        if (!req.file) return res.status(400).json({ error: "CSV file is required" });
    
        const organizations = [];
        const errors = [];
        let rowIndex = 1;
        const existingEmails = new Set(
          (await prisma.organization_master.findMany({ select: { contact_email: true } }))
            .map((record) => record.contact_email?.toLowerCase())
        );
    
        fs.createReadStream(req.file.path)
          .pipe(csvParser())
          .on("data", (row) => {
            let validationErrors = [];
            if (!row.name) validationErrors.push("Missing 'name'");
            if (!row.contact_email || !isValidEmail(row.contact_email)) validationErrors.push("Invalid 'contact_email'");
            if (existingEmails.has(row.contact_email?.toLowerCase())) validationErrors.push(`Duplicate 'contact_email': ${row.contact_email}`);
    
            if (validationErrors.length > 0) {
              errors.push({ row: rowIndex, errors: validationErrors });
              logErrorToFile(`Row ${rowIndex}: ${validationErrors.join(", ")}`);
            } else {
              organizations.push({
                name: row.name,
                org_type: row.org_type,
                contact_email: row.contact_email,
                invite_status: "PENDING",
                created_date: new Date(),
              });
            }
            rowIndex++;
          })
          .on("end", async () => {
            try {
              if (errors.length > 0) {
                const logFilePath = "invalid_rows.log";
                transporter.sendMail({
                  from: process.env.EMAIL_USER,
                  to: process.env.NOTIFY_EMAIL,
                  subject: "Bulk Registration Errors",
                  text: "Some rows were rejected. See the attached log file.",
                  attachments: [{ filename: "invalid_rows.log", path: logFilePath }],
                });
                return res.status(400).json({ message: "Validation errors found", logFile: "/download-log" });
              }
    
              const result = await prisma.organization_master.createMany({ data: organizations, skipDuplicates: true });
              fs.unlinkSync(req.file.path);
              return res.status(201).json({ message: "Bulk registration successful", insertedCount: result.count });
            } catch (error) {
              return res.status(500).json({ error: "Database insertion failed" });
            }
          });
      } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
      }

}



export const createBulkUser = async (req, res) => {

}



