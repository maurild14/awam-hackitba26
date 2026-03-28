
# Archivo: `/docs/infra/index.md`

```md
# Infra Index

## Qué cubre esta sección
Describe la infraestructura del MVP y cómo se despliega y opera.

## Componentes principales
- Vercel para frontend,
- AWS EC2 t3.small para backend, Vault y Docker,
- Nginx,
- PM2,
- S3,
- ECR,
- GitHub Actions,
- CloudWatch.

## Leer según la tarea
- deployment y recursos AWS: `deployment-and-aws.md`
- variables sensibles: `../config/environment-variables.md`
- runbooks: `../operations/runbooks.md`

## Regla operativa
La simplicidad del MVP es intencional. No introducir complejidad tipo Kubernetes/EKS/Fargate sin necesidad real.
```

---