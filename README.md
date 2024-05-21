# saas-multitenant-serverless

This project presents an example of how you can build **multi-tenant** serverless applications on **AWS** using **Lambda**, **API Gateway**, **DynamoDB**, and **Cognito**.

The main focus is to show how it is possible to use dynamic IAM policies and tagged sessions to make sure that each tenant can only access their own data.

---

This example is used as an example as part of the following talks (click on the image to access the slides from the talk):

[![Building Secure and Efficient SaaS Platforms on AWS Serverless by Guilherme Dalla Rosa and Luciano Mammino - Serverless Days Belfast 2024](/images/serverless-days-belfast-2024.png)](https://fth.link/tenants)


## Architecture and data flow

The following picture represents at a high level the architecture of the application and how data flows in the system:

![The data flow](/images/flow.png)


## Requirements

- An AWS Account
- AWS CLI installed and configured
- Serverless framework and Node.js installed


## Deploying

To deploy the application you can simply run the following command:

```bash
npm install
npx serverless deploy
```



## Cleaning up

To remove all the resources created by the application you can run the following command:

```bash
npx serverless remove
```


## Additional Resources

- https://docs.aws.amazon.com/IAM/latest/UserGuide/id_session-tags.html
- https://github.com/aws-samples/aws-saas-factory-ref-solution-serverless-saas
- https://aws.amazon.com/blogs/security/how-to-implement-saas-tenant-isolation-with-abac-and-aws-iam
- https://docs.aws.amazon.com/pdfs/wellarchitected/latest/saas-lens/wellarchitected-saas-lens.pdf


## License

This project is licensed under the MIT License - see the [LICENSE](/LICENSE) file for details


## Contributing

Everyone is very welcome to contribute to this project. You can contribute just by submitting bugs or suggesting improvements by [opening an issue](https://github.com/fourTheorem/saas-multitenant-serverless/issues) or by [sending a pull request](https://github.com/fourTheorem/saas-multitenant-serverless/compare).
