namespace JobTracker.Api.Models
{
    /// <summary>
    /// Represents the source from which a job posting was found.
    /// </summary>
    public enum ApplicationSource
    {
        Unknown,
        Arbeitsagentur,
        LinkedIn,
        Indeed,
        Xing,
        Stepstone,
        Referral,
        Recruiter,
        CompanyWebsite,
        CarreerFair,
        Other
    }
}
