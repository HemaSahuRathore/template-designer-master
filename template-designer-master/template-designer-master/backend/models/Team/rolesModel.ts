export interface NewRolesModel {
    _key: any,
    newRole: [{
        role: string,
        isAssignedToMember:Boolean,
        applicationNames: Array<Object>,
        createdAt: number,
    }]
}

export interface RolesModel {
    role: string,
    isAssignedToMember:Boolean,
    applicationNames: Array<Object>,
    createdAt: number,
}
