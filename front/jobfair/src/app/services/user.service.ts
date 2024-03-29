import { Injectable } from '@angular/core';
import { User, CV, JobApplication } from "../misc/models";
import { HttpService } from './http.service';
import { Config } from '../misc/config';


const siteUrl = Config.baseServerUrl;
const registerUrl = siteUrl + "/user/register";
const loginUrl = siteUrl + "/user/login";
const setPasswordUrl = siteUrl + "/user/setpwd";
const setCVUrl = siteUrl + "/user/setcv";
const pictureUrl = siteUrl + "/user/picture";
const applyToOfferUrl = siteUrl + "/user/apply";
const myApplicationsUrl=siteUrl+"/user/myapplications";
const rateApplicationUrl=siteUrl+"/user/rateapp";

@Injectable({
    providedIn: 'root'
})
export class UserService
{
    public loggedIn: boolean;
    async logIn(username: String, password: String): Promise<String>
    {
        let response = await this.httpService.doPostForObject(loginUrl, { username: username, password: password });
        if (response.message != "OK")
        {
            return response.message;
        }
        let user: User = response.payload;
        localStorage["userObject"] = JSON.stringify(user);
        this.loggedIn = true;
        return "OK";
    }
    currentUser(): User
    {
        if (!localStorage["userObject"])
        {
            return {
                admin:false,
                companyInfo:{
                    
                },
                humanInfo:{

                },
                kind:"none",
                username:"none"
            }
        }
        return JSON.parse(localStorage["userObject"]);
    }
    async logOut()
    {
        localStorage.removeItem("userObject");
        this.loggedIn = false;
    }
    async doRegister(user: User): Promise<String>
    {
        let result = await this.httpService.doPostForString(registerUrl, user);
        return result;
    }
    async setPassword(oldPassword: String, newPassword: String): Promise<String>
    {
        let response = await this.httpService.doPostForString(setPasswordUrl, { oldPassword: oldPassword, newPassword: newPassword });
        return response;
    }
    async enterCV(cv: CV): Promise<String>
    {
        let current = this.currentUser();
        let response = await this.httpService.doPostForString(setCVUrl, cv);
        if (response == "OK")
        {
            current.humanInfo.cv = cv;
            localStorage["userObject"] = JSON.stringify(current);
        }
        return response;
    }
    async applyToOffer(application: JobApplication): Promise<String>
    {
        let response = await this.httpService.doPostForString(applyToOfferUrl, application);
        return response;
    }
    getPictureUrl(username: String): String
    {
        if (!username) return "#";
        return pictureUrl + "/" + username;
    }
    getLongUserName():String
    {
        if(!this.loggedIn) return "";
        if(this.currentUser().kind=="human")
        {
            return this.currentUser().humanInfo.firstName+" "+this.currentUser().humanInfo.lastName;
        }
        else if(this.currentUser().kind=="company")
        {
            return this.currentUser().companyInfo.name;
        }
        else
        {
            return "Admin";
        }
    }
    async getMyApplications(): Promise<JobApplication[]>
    {
        return (await this.httpService.doPostForObject(myApplicationsUrl, {})).payload;
    }
    async rateApplication(id:String, rating:number):Promise<String>
    {
        return await this.httpService.doPostForString(rateApplicationUrl, {appId:id, rating:rating});
    }
    constructor(private httpService: HttpService)
    {
        if (localStorage["userObject"])
        {
            this.loggedIn = true;
        }
        else
        {
            this.loggedIn = false;
        }
    }
    ngOnInit()
    {
    }
}
