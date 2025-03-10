import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Master } from '../schemas/master.schema'
import { Skill } from '../schemas/skill.schema'
import { Category } from '../schemas/category.schema'
import { Employee } from '../schemas/employee.schema';

@Injectable()
export class DashboardService {
    constructor(
        @InjectModel(Master.name)
        private  masterModel: mongoose.Model<Master>,
        @InjectModel(Skill.name) private  skillModel: mongoose.Model<Skill>,
        @InjectModel(Category.name) private  categoryModel: mongoose.Model<Category>,
        @InjectModel(Employee.name) private  employeeModel: mongoose.Model<Employee>,
    ) {}

    //get count of all 3 together in techstack management
    async getCounts() {
        const [categoryCount, typeCount, skillCount] = await Promise.all([
            this.categoryModel.countDocuments(),
            this.masterModel.countDocuments(),
            this.skillModel.countDocuments(),
        ]);

        return {
            totalCategories: categoryCount,
            totalTypes: typeCount,
            totalSkills: skillCount,
        };
    }

    //get category count
    async getCategoryCounts(){
        const  [categoryCount] = await Promise.all([
            this.categoryModel.countDocuments()
        ]);
        return{
            totalCategories: categoryCount
        }
    }

    //get type count

    async getSkillCounts(){
        const  [skillCount] = await Promise.all([
            this.skillModel.countDocuments()
        ]);
        return{
            totalSkills: skillCount
        }
    }

    //get all type
    async getTypeCounts(){
        const  [typeCount] = await Promise.all([
            this.masterModel.countDocuments()
        ]);
        return{
            totalTypes: typeCount
        }
    }

//   count of skills under each category
async getSkillCountByCategory() {
    return this.skillModel.aggregate([
        {
            $group: {
                _id: '$category', // Group by category ID
                skillCount: { $sum: 1 }, // Count the number of skills
            },
        },
        {
            $lookup: {
                from: 'categories', // The collection name for categories
                localField: '_id',
                foreignField: '_id',
                as: 'categoryDetails',
            },
        },
        {
            $unwind: '$categoryDetails', // Flatten the categoryDetails array
        },
        {
            $project: {
                _id: 0,
                categoryId: '$_id',
                skillCount: 1,
                categoryName: '$categoryDetails.name',
            },
        },
    ]);
}

//how many skill under same type
async getSkillCountBySkillType() {
    return this.skillModel.aggregate([
      {
        $group: {
          _id: '$skill_type', // Group by skill_type ID
          skillCount: { $sum: 1 }, // Count the number of skills
        },
      },
      {
        $lookup: {
          from: 'masters', // The collection name for Master schema
          localField: '_id',
          foreignField: '_id',
          as: 'skillTypeDetails',
        },
      },
      {
        $unwind: '$skillTypeDetails', // Flatten the skillTypeDetails array
      },
      {
        $project: {
          _id: 0,
          skillTypeId: '$_id',
          skillCount: 1,
          skillTypeName: '$skillTypeDetails.type',
          skillTypeValue: '$skillTypeDetails.value',
        },
      },
    ]);
  }

  //get employer count
  async getEmployeeCounts(){
    const  [employeeCount] = await Promise.all([
        this.employeeModel.countDocuments()
    ]);
    return{
        totalCategories: employeeCount
    }
}
//active employer
async getActiveEmployeeCount() {
    const [activeEmployeeCount] = await Promise.all([
      this.employeeModel.countDocuments({ is_active: "Active" }) // Filter by is_active: true
    ]);
  
    return {
      activeEmployees: activeEmployeeCount
    };
  }
//diabled
async getDisableEmployeeCount() {
    const [activeEmployeeCount] = await Promise.all([
      this.employeeModel.countDocuments({ is_active: "Disable" }) // Filter by is_active: true
    ]);
  
    return {
      activeEmployees: activeEmployeeCount
    };
  }

  //archieved
  async getArchievdEmployeeCount() {
    const [activeEmployeeCount] = await Promise.all([
      this.employeeModel.countDocuments({ is_active: "Archieved" }) // Filter by is_active: true
    ]);
  
    return {
      activeEmployees: activeEmployeeCount
    };
  }
  
  

}
