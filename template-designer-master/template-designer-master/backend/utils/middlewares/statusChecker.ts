import { ProjectState } from '../enums/projectState';
export const statusChecker = (startDate: string, endDate: string, status: any) => {
    var todaysDate = new Date();
    var projectStartDate = new Date(startDate);
    var projectEndDate = new Date(endDate);
    if (projectEndDate != projectStartDate && projectEndDate > todaysDate) {
        if (todaysDate < projectStartDate) {
            return ProjectState.NotStarted;
        }
        else
            return ProjectState.Active;
    }
    else if (projectEndDate < todaysDate) {
        return ProjectState.Finished;
    }
    else
        return ProjectState.Suspended;
}
